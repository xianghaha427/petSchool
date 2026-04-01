package com.petschool;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.petschool.entity.User;
import com.petschool.mapper.UserMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

@SpringBootTest
public class MybatisPlusTest {
    @Autowired
    private UserMapper userMapper;

    @Test
    public void testQueryWrapper() {
        //条件构造器
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        //查询用户名包含 "a" 的用户
        queryWrapper.like("username", "a");
        List<User> list = userMapper.selectList(queryWrapper);
        list.forEach(System.out::println);
    }

    @Test
    public void testAR(){
        //AR新增
        User user = new User();
        user.setUserName("test");
        user.setPassword("123456");
        user.setId(10L);
        user.insert();
        //AR查询
        User selectUser = user.selectById();
        System.out.println(selectUser);
        //AR更新
        User updateUser=new User();
        updateUser.setId(selectUser.getId());
        updateUser.setUserName("test2");
        System.out.println(updateUser.updateById());
        //AR删除
        User deleteUser=new User();
        deleteUser.setId(selectUser.getId());
        System.out.println(deleteUser.deleteById());
    }

    @Test
    public void testARSelectALL(){
        //测试查询所有用户
        User user=new User();
        List<User> users = user.selectAll();
        users.forEach(System.out::println);
        //测试AR分页查询
        //1.创建分页条件
        Page<User> page=new Page<>(0,1);
        //2.查询构造器
        QueryWrapper<User> queryWrapper=new QueryWrapper<>();
        queryWrapper.like("username","a");
        //3.执行分页查询
        User user1=new User();
        IPage iPage=user1.selectPage(page, queryWrapper);
        //4.获取分页结果
        List<User> records = iPage.getRecords();
        records.forEach(System.out::println);
    }
}
