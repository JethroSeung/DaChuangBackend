package com.example.uavdockingmanagementsystem.controller;

import com.example.uavdockingmanagementsystem.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.ui.Model;
import com.example.uavdockingmanagementsystem.model.DTO.user.RegisterDTO;
import com.example.uavdockingmanagementsystem.model.DTO.user.LoginDTO;
import com.example.uavdockingmanagementsystem.model.DTO.user.GetUserListForAdminDTO;
import com.example.uavdockingmanagementsystem.model.DTO.user.UpdateUserDTO;
import com.example.uavdockingmanagementsystem.model.DTO.user.CompleteDTO;
import com.example.uavdockingmanagementsystem.service.UserService;
import com.example.uavdockingmanagementsystem.common.BaseContext;
import com.example.uavdockingmanagementsystem.model.VO.userVO.LoginVO;
import com.example.uavdockingmanagementsystem.model.VO.page.PageVO;
import org.springframework.beans.BeanUtils;

/**
 * <p>
 * 用户 前端控制器
 * </p>
 *
 * @author 刘文清
 * @since 2025-07-15
 */

@Controller
@RequestMapping("/user")
public class UserController {

    private final UserService userService;
    private final BaseContext baseContext;

    @Autowired
    public UserController(UserService userService, BaseContext baseContext) {
        this.userService = userService;
        this.baseContext = baseContext;
    }

    // 管理员注册
    @PostMapping("/register")
    public String register(@ModelAttribute RegisterDTO registerDTO, Model model) {
        User user = userService.adminRegister(registerDTO);
        model.addAttribute("user", user);
        return "user/registerResult";
    }

    // 密码登录
    @PostMapping("/login")
    public String login(@ModelAttribute LoginDTO loginDTO, Model model) {
        LoginVO loginVO = userService.userLogin(loginDTO);
        model.addAttribute("loginVO", loginVO);
        return "user/loginResult";
    }

    // 管理员获取用户列表
    @GetMapping("/list")
    public String getUserListForAdmin(@RequestParam(required = false) Integer page,
                                      @RequestParam(required = false) Integer size,
                                      Model model) {
        // 假设GetUserListForAdminDTO有分页参数
        GetUserListForAdminDTO dto = new GetUserListForAdminDTO(page, size);
        PageVO<User> userList = userService.getUserListForAdmin(dto);
        model.addAttribute("userList", userList);
        return "user/list";
    }

    // 管理员修改用户信息
    @PostMapping("/update")
    public String updateUser(@ModelAttribute UpdateUserDTO updateUserDTO, Model model) {
        Long userId = updateUserDTO.getUserId();
        User user = userService.getById(userId);
        BeanUtils.copyProperties(updateUserDTO, user);
        boolean updated = userService.updateById(user);
        model.addAttribute("user", updated ? user : null);
        return "user/updateResult";
    }

    // 获取当前用户信息
    @GetMapping("/info")
    public String getUserInfo(Model model) {
        Long userId = baseContext.getCurrentUser().getUserId();
        User user = userService.getById(userId);
        model.addAttribute("user", user);
        return "user/info";
    }

    // 用户完善信息
    @PostMapping("/complete")
    public String complete(@ModelAttribute CompleteDTO completeDTO, Model model) {
        Long userId = baseContext.getCurrentUser().getUserId();
        User user = userService.getById(userId);
        BeanUtils.copyProperties(completeDTO, user);
        userService.updateById(user);
        model.addAttribute("user", user);
        return "user/completeResult";
    }
}
