package com.pinyougou.cart.controller;

import com.alibaba.dubbo.config.annotation.Reference;
import com.pinyougou.cart.service.CartService;
import com.pinyougou.pojogroup.Cart;
import entity.LoginResult;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.rmi.server.RMIClassLoader;
import java.util.List;

@RestController
@RequestMapping("/cart")
public class CartController {

    @Reference(timeout = 6000)
    private CartService cartService;

    /**
     * 添加购物车
     *
     * @param cartList
     * @param itemId
     * @param num
     * @return
     */
    @RequestMapping("/addGoodsToCartList")
    public LoginResult addGoodsToCartList(@RequestBody List<Cart> cartList, Long itemId, Integer num) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (username.equals("anonymousUser")) {
            //未登录
            cartList = cartService.addGoodsToCartList(cartList, itemId, num);
            return new LoginResult(true, "", cartList);
        } else {
            //登录
            List<Cart> cartListFromRedis = cartService.findCartListFromRedis(username);
            cartListFromRedis = cartService.addGoodsToCartList(cartListFromRedis, itemId, num);
            cartService.saveCartListToRedis(cartListFromRedis, username);
            return new LoginResult(true, username, cartListFromRedis);

        }


    }

    /**
     * 查询并合并购物车
     *
     * @param cartList
     * @return
     */
    @RequestMapping("/findCartList")
    public LoginResult findCartList(@RequestBody List<Cart> cartList) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (username.equals("anonymousUser")) {
            //未登录
            return new LoginResult(true, "", cartList);

        } else {
            //登录
            //合并购物车
            List<Cart> cartListFromRedis = cartService.findCartListFromRedis(username);
            if (cartList.size() > 0) {
                cartListFromRedis = cartService.mergeCartList(cartList, cartListFromRedis);
                cartService.saveCartListToRedis(cartListFromRedis, username);
            }
            return new LoginResult(true, username, cartListFromRedis);
        }
    }
}
