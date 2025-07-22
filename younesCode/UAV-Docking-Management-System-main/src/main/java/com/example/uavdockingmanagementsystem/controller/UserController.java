package com.example.uavdockingmanagementsystem.controller;

import com.example.uavdockingmanagementsystem.model.User;
import com.example.uavdockingmanagementsystem.model.VO.userVO.UserInfoVO;
import com.example.uavdockingmanagementsystem.response.BusinessException;
import com.example.uavdockingmanagementsystem.response.ErrorCode;
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
 * user控制器
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
        GetUserListForAdminDTO dto = new GetUserListForAdminDTO(page, size);
        PageVO<User> userList = userService.getUserListForAdmin(dto);
        model.addAttribute("userList", userList);
        return "user/list";
    }

    // 管理员或本人修改用户信息
    @PostMapping("/update")
    public String updateUser(@ModelAttribute UpdateUserDTO updateUserDTO, Model model) {
        Long userId = updateUserDTO.getUserId();
        UserInfoVO currentUser = baseContext.getCurrentUser();
        // 只允许管理员或本人修改
        if (!"admin".equals(currentUser.getUserType()) && !currentUser.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
        }
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

    /**
     * 软删除用户（仅管理员可操作）
     * 采用表单提交ID，结合权限校验和参数校验
     */
    @PostMapping("/delete")
    public String deleteUser(@RequestParam("userId") Long userId, Model model) {
        // 1. 获取当前登录用户（假设拦截器已确保用户登录）
        UserInfoVO currentUser = baseContext.getCurrentUser();

        // 2. 校验权限（仅管理员可删除）
        if (!"admin".equals(currentUser.getUserType())) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR, "无删除权限");
        }

        // 3. 校验用户ID合法性
        if (userId == null || userId <= 0) {
            model.addAttribute("success", false);
            model.addAttribute("message", "无效的用户ID");
            return "user/deleteResult";
        }

        // 4. 校验用户是否存在且未被删除
        User user = userService.getById(userId);
        if (user == null) {
            model.addAttribute("success", false);
            model.addAttribute("message", "用户不存在");
            return "user/deleteResult";
        }
        if (user.getIsDelete() == 1) {
            model.addAttribute("success", false);
            model.addAttribute("message", "用户已被删除");
            return "user/deleteResult";
        }

        // 5. 执行软删除
        user.setIsDelete(1);
        boolean deleted = userService.updateById(user);

        // 6. 返回结果
        model.addAttribute("success", deleted);
        model.addAttribute("message", deleted ? "删除成功" : "删除失败");
        return "user/deleteResult";
    }
}