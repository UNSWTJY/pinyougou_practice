package com.pinyougou.search.service.impl;

import com.alibaba.dubbo.config.annotation.Service;
import com.pinyougou.pojo.TbItem;
import com.pinyougou.search.service.ItemSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.solr.core.SolrTemplate;
import org.springframework.data.solr.core.query.*;
import org.springframework.data.solr.core.query.result.*;

import java.util.*;

@Service
public class ItemSearchServiceImpl implements ItemSearchService {
    @Autowired
    SolrTemplate solrTemplate;

    @Autowired
    RedisTemplate redisTemplate;

    @Override
    public Map<String, Object> search(Map searchMap) {
        Map<String, Object> map = new HashMap<>();
        //处理空格
        String keywords = (String) searchMap.get("keywords");
        searchMap.put("keywords", keywords.replace(" ", ""));
        //1.关键字查询
        map.putAll(searchItemList(searchMap));
        //2.根据关键字查询商品分类列表
        List categoryList = searchCategoryList(searchMap);
        map.put("categoryList", categoryList);
        //3.根据模板名称查询品牌列表，规格列表
        //获取模板名称
        String categoryName = (String) searchMap.get("category");
        if (!"".equals(categoryName)) {
            map.putAll(searchBrandAndSpecList(categoryName));
        } else {
            if (categoryList.size() > 0) {
                map.putAll(searchBrandAndSpecList((String) categoryList.get(0)));
            }
        }

        return map;
    }

    @Override
    public void importList(List list) {
        solrTemplate.saveBeans(list);
        solrTemplate.commit();
    }

    @Override
    public void deleteByGoodsIds(Long[] goodsIds) {
        Query query = new SimpleQuery();
        Criteria criteria = new Criteria("item_goodsid").in(Arrays.asList(goodsIds));
        query.addCriteria(criteria);
        solrTemplate.delete(query);
        solrTemplate.commit();
    }

    /**
     * 关键字查询
     *
     * @param searchMap
     * @return
     */
    private Map<String, Object> searchItemList(Map searchMap) {
        Map<String, Object> map = new HashMap<>();
        //1.关键字查询
        //Query query = new SimpleQuery();
        HighlightQuery query = new SimpleHighlightQuery();
        String keywords = (String) searchMap.get("keywords");
        Criteria criteria = new Criteria("item_keywords").is(keywords);
        query.addCriteria(criteria);
        //2.分类筛选
        if (!"".equals(searchMap.get("category"))) {
            Criteria filterCriteria = new Criteria("item_category").is(searchMap.get("category"));
            FilterQuery filterQuery = new SimpleFilterQuery(filterCriteria);
            query.addFilterQuery(filterQuery);
        }
        //3.品牌筛选
        if (!"".equals(searchMap.get("brand"))) {
            Criteria filterCriteria = new Criteria("item_brand").is(searchMap.get("brand"));
            FilterQuery filterQuery = new SimpleFilterQuery(filterCriteria);
            query.addFilterQuery(filterQuery);
        }
        //4.规格筛选
        if (searchMap.get("spec") != null) {
            Map<String, String> specMap = (Map) searchMap.get("spec");
            for (String key : specMap.keySet()) {
                Criteria filterCriteria = new Criteria("item_spec_" + key).is(specMap.get(key));
                FilterQuery filterQuery = new SimpleFilterQuery(filterCriteria);
                query.addFilterQuery(filterQuery);
            }

        }
        //5.价格区间筛选
        if (!"".equals(searchMap.get("price"))) {
            String[] prices = ((String) searchMap.get("price")).split("-");
            if (!"0".equals(prices[0])) {
                Criteria filterCriteria = new Criteria("item_price").greaterThanEqual(prices[0]);
                FilterQuery filterQuery = new SimpleFilterQuery(filterCriteria);
                query.addFilterQuery(filterQuery);
            }
            if (!"*".equals(prices[1])) {
                Criteria filterCriteria = new Criteria("item_price").lessThanEqual(prices[1]);
                FilterQuery filterQuery = new SimpleFilterQuery(filterCriteria);
                query.addFilterQuery(filterQuery);
            }
        }

        //6.分页查询
        Integer pageNum = (Integer) searchMap.get("pageNum");
        Integer pageSize = (Integer) searchMap.get("pageSize");
        if (pageNum == null) {
            pageNum = 1;
        }
        if (pageSize == null) {
            pageSize = 20;
        }
        query.setOffset((pageNum - 1) * pageSize);
        query.setRows(pageSize);

        //7.排序
        String sortType = (String) searchMap.get("sort");
        String sortField = (String) searchMap.get("sortField");
        if (sortType != null && !sortType.equals("")) {
            if (sortType.equalsIgnoreCase("ASC")) {
                Sort sort = new Sort(Sort.Direction.ASC, "item_" + sortField);
                query.addSort(sort);
            }
            if (sortType.equalsIgnoreCase("DESC")) {
                Sort sort = new Sort(Sort.Direction.DESC, "item_" + sortField);
                query.addSort(sort);
            }
        }

        //8.高亮查询
        HighlightOptions highlightOptions = new HighlightOptions().addField("item_title");
        highlightOptions.setSimplePrefix("<em style='color:red'>");
        highlightOptions.setSimplePostfix("</em>");
        query.setHighlightOptions(highlightOptions);
        //查询
        HighlightPage<TbItem> highlightPage = solrTemplate.queryForHighlightPage(query, TbItem.class);
        List<HighlightEntry<TbItem>> highlighted = highlightPage.getHighlighted();
        for (HighlightEntry<TbItem> entry : highlighted) {
            TbItem item = entry.getEntity();
            List<HighlightEntry.Highlight> highlights = entry.getHighlights();

            if (highlights.size() > 0 && highlights.get(0).getSnipplets().size() > 0) {
                item.setTitle(highlights.get(0).getSnipplets().get(0));
            }

        }

        //ScoredPage<TbItem> page = solrTemplate.queryForPage(query, TbItem.class);
        map.put("rows", highlightPage.getContent());
        map.put("totalPages", highlightPage.getTotalPages());
        map.put("total", highlightPage.getTotalElements());
        return map;
    }

    /**
     * 根据关键字查询商品分类列表
     *
     * @param searchMap
     * @return
     */
    private List searchCategoryList(Map searchMap) {
        List<String> categoryList = new ArrayList<>();
        Query query = new SimpleQuery();
        Criteria criteria = new Criteria("item_keywords").is(searchMap.get("keywords"));
        query.addCriteria(criteria);

        //设置分组对象
        GroupOptions groupOptions = new GroupOptions().addGroupByField("item_category");
        query.setGroupOptions(groupOptions);
        //获取分组页对象
        GroupPage<TbItem> page = solrTemplate.queryForGroupPage(query, TbItem.class);
        //获取分组结果集
        GroupResult<TbItem> groupResult = page.getGroupResult("item_category");
        //获取入口
        Page<GroupEntry<TbItem>> groupEntries = groupResult.getGroupEntries();
        //获取结果
        List<GroupEntry<TbItem>> content = groupEntries.getContent();
        for (GroupEntry<TbItem> entry : content) {
            categoryList.add(entry.getGroupValue());
        }
        return categoryList;

    }

    /**
     * 根据模板名称查询品牌列表，规格列表
     *
     * @param category
     * @return
     */
    private Map searchBrandAndSpecList(String category) {
        Map map = new HashMap();
        //根据模板名称获取模板id
        Long typeId = (Long) redisTemplate.boundHashOps("itemCat").get(category);
        if (typeId != null) {
            //获取brandList
            List brandList = (List) redisTemplate.boundHashOps("brandList").get(typeId);
            map.put("brandList", brandList);
            //获取specList
            List specList = (List) redisTemplate.boundHashOps("specList").get(typeId);
            map.put("specList", specList);
        }
        return map;
    }
}
