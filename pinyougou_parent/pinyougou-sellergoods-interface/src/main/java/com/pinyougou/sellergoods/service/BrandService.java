package com.pinyougou.sellergoods.service;

import com.pinyougou.pojo.TbBrand;
import entity.PageResult;

import java.util.List;
import java.util.Map;

public interface BrandService {

    /**
     * 查询所有品牌
     */
    List<TbBrand> findAll();

    /**
     * 分页查询所有品牌列表
     * @param pageNum
     * @param pageSize
     * @return
     */
    PageResult findPage(int pageNum, int pageSize);

    /**
     * 增加品牌
     * @param tbBrand
     */
    void add(TbBrand tbBrand);

    /**
     * 根据id查询品牌
     * @param id
     * @return
     */
    TbBrand findOne(Long id);

    /**
     * 修改品牌信息
     * @param tbBrand
     */
    void update(TbBrand tbBrand);

    /**
     * 根据id删除品牌
     * @param id
     */
    void delete(Long[] id);

    PageResult findPage(TbBrand tbBrand, int pageNum, int pageSize);

    List<Map> selectOptionList();

}
