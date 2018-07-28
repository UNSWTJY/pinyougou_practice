//控制层
app.controller('goodsController', function ($scope, $controller, goodsService, uploadService, itemCatService, typeTemplateService) {

    $controller('baseController', {$scope: $scope});//继承

    //读取列表数据绑定到表单中  
    $scope.findAll = function () {
        goodsService.findAll().success(
            function (response) {
                $scope.list = response;
            }
        );
    }

    //分页
    $scope.findPage = function (page, rows) {
        goodsService.findPage(page, rows).success(
            function (response) {
                $scope.list = response.rows;
                $scope.paginationConf.totalItems = response.total;//更新总记录数
            }
        );
    }

    //查询实体
    $scope.findOne = function (id) {
        goodsService.findOne(id).success(
            function (response) {
                $scope.entity = response;
            }
        );
    }

    //保存
    $scope.save = function () {
        var serviceObject;//服务层对象
        if ($scope.entity.id != null) {//如果有ID
            serviceObject = goodsService.update($scope.entity); //修改
        } else {
            serviceObject = goodsService.add($scope.entity);//增加
        }
        serviceObject.success(
            function (response) {
                if (response.success) {
                    //重新查询
                    $scope.reloadList();//重新加载
                } else {
                    alert(response.message);
                }
            }
        );
    }


    //批量删除
    $scope.dele = function () {
        //获取选中的复选框
        goodsService.dele($scope.selectIds).success(
            function (response) {
                if (response.success) {
                    $scope.reloadList();//刷新列表
                }
            }
        );
    }

    $scope.searchEntity = {};//定义搜索对象

    //搜索
    $scope.search = function (page, rows) {
        goodsService.search(page, rows, $scope.searchEntity).success(
            function (response) {
                $scope.list = response.rows;
                $scope.paginationConf.totalItems = response.total;//更新总记录数
            }
        );
    }

    //增加
    $scope.add = function () {
        //提取富文本内容
        $scope.entity.goodsDesc.introduction = editor.html();
        goodsService.add($scope.entity).success(function (response) {
            alert(response.message);
            if (response.success) {
                //清空列表
                $scope.entity = {};
                //清空富文本
                editor.html('');
            }

        });

    };

    //上传图片
    $scope.uploadFile = function () {
        uploadService.uploadFile().success(function (response) {
            alert(response);
            if (response.error == 0) {
                $scope.image_entity.url = response.url;
            } else {
                alert(response.message);
            }

        });

    };

    //定义实体结构
    $scope.entity = {goods: {}, goodsDesc: {itemImages: [], specificationItems: []}, itemList: []};

    //增加图片方法
    $scope.add_image_entity = function () {
        $scope.entity.goodsDesc.itemImages.push($scope.image_entity);

    };

    //删除图片方法
    $scope.remove_image_entity = function (index) {
        $scope.entity.goodsDesc.itemImages.splice(index, 1);

    };

    // $scope.entity = {goods: {}, goodsDesc: {itemImages: [],specificationItems:[]}, itemList: []};
    //查询商品顶级分类
    $scope.findItemCat1List = function () {
        itemCatService.findByParentId(0).success(function (response) {
            $scope.itemCat1List = response;

        });

    };

    //根据顶级分类的变化查询二级分类
    $scope.$watch('entity.goods.category1Id', function (newValue, oldValue) {
        itemCatService.findByParentId(newValue).success(function (response) {
            $scope.itemCat2List = response;

        });

    });
    //根据二级分类的变化查询三级分类
    $scope.$watch('entity.goods.category2Id', function (newValue, oldValue) {
        itemCatService.findByParentId(newValue).success(function (response) {
            $scope.itemCat3List = response;

        });

    });
    //根据三级分类的变化查询模板id
    $scope.$watch('entity.goods.category3Id', function (newValue, oldValue) {
        itemCatService.findOne(newValue).success(function (response) {
            $scope.entity.goods.typeTemplateId = response.typeId;

        });

    });
    //根据模板id查询模板
    $scope.$watch('entity.goods.typeTemplateId', function (newValue, oldValue) {
        typeTemplateService.findOne(newValue).success(function (response) {
            $scope.typeTemplate = response;
            //获取品牌列表
            $scope.typeTemplate.brandIds = JSON.parse($scope.typeTemplate.brandIds);
            //获取扩展列表并存入entity
            $scope.entity.goodsDesc.customAttributeItems = JSON.parse($scope.typeTemplate.customAttributeItems);

        });
        //根据模板id查询规格列表，包括规格选项
        typeTemplateService.searchSpecList(newValue).success(function (response) {
            $scope.specList = response;


        });


    });

    // $scope.entity = {goods: {}, goodsDesc: {itemImages: [],specificationItems:[]}, itemList: []};
    //specItems=entity.goodsDesc.specificationItems=[{"name":name1,"values":[value11,value12]},{"name":name2,"values":[value2]}]
    //更新选定的规格
    $scope.updateSpecItems = function ($event, name, value) {
        //判断集合specItems中是否有name值为name的specItem
        var object = $scope.searchObjectByKey($scope.entity.goodsDesc.specificationItems, "name", name);
        if (object != null) {
            //存在，追加或移出value
            if ($event.target.checked) {
                //勾选，追加value
                object.values.push(value);
            } else {
                //未勾选，移出value
                object.values.splice(object.values.indexOf(value), 1);
                //如果此时values为空，移除name
                if (object.values.length == 0) {
                    $scope.entity.goodsDesc.specificationItems.splice($scope.entity.goodsDesc.specificationItems.indexOf(object), 1);
                }
            }
        } else {
            //不存在，添加新的specItem
            $scope.entity.goodsDesc.specificationItems.push({name: name, values: [value]})
        }
    };

    // $scope.entity = {goods: {}, goodsDesc: {itemImages: [],specificationItems:[]}, itemList: []};
    //specItems=entity.goodsDesc.specificationItems=[{"name":name1,"values":[value11,value12]},{"name":name2,"values":[value2]}]
    //创建SKU列表
    $scope.createItemList = function () {
        //初始表
        $scope.entity.itemList = [{spec: {}, price: 0, num: 99999, status: "1", isDefault: "0"}];
        //spec:{"name":name,"value":value}
        var items = $scope.entity.goodsDesc.specificationItems;
        for (var i = 0; i < items.length; i++) {
            $scope.entity.itemList = addColumn($scope.entity.itemList, items[i].name, items[i].values);
        }

    };

    addColumn = function (list, name, values) {
        var newList = [];
        for (var i = 0; i < list.length; i++) {
            var oldRow = list[i];
            for (var j = 0; j < values.length; j++) {
                //深克隆
                var newRow = JSON.parse(JSON.stringify(oldRow));
                newRow.spec[name] = values[j];
                newList.push(newRow);
            }
        }
        return newList;

    };
    //设置默认值
    $scope.setDefault = function (index) {
        for (var i = 0; i < $scope.entity.itemList.length; i++) {
            if (i == index) {
                $scope.entity.itemList[i].isDefault = "1";
            } else {
                $scope.entity.itemList[i].isDefault = "0";
            }
        }

    };
});	
