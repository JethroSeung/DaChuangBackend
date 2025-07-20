package com.example.uavdockingmanagementsystem.service;

import cn.hutool.core.lang.Snowflake;
import com.example.uavdockingmanagementsystem.model.DTO.user.GetUserListForAdminDTO;
import com.example.uavdockingmanagementsystem.model.DTO.user.LoginDTO;
import com.example.uavdockingmanagementsystem.model.DTO.user.RegisterDTO;
import com.example.uavdockingmanagementsystem.model.User;
import com.example.uavdockingmanagementsystem.model.VO.page.PageVO;
import com.example.uavdockingmanagementsystem.model.VO.userVO.LoginVO;
import com.example.uavdockingmanagementsystem.repository.UserRepository;
import com.example.uavdockingmanagementsystem.util.JwtUtil;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.BeanUtils;
import org.slf4j.Logger;  // 添加日志包导入
import org.slf4j.LoggerFactory;  // 添加日志工厂导入
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import com.example.uavdockingmanagementsystem.response.BusinessException;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);  // 定义日志记录器

    @Autowired
    private UserRepository userRepository;

    /**
     * 管理员注册
     */
    public User adminRegister(RegisterDTO registerDTO) {
        // 检查账号是否已存在
        if (userRepository.existsByAccount(registerDTO.getAccount())) {
            throw new IllegalArgumentException("账号已存在");
        }

        // 创建用户对象
        User user = new User();
        user.setAccount(registerDTO.getAccount());
        user.setPassword((DigestUtils.md5DigestAsHex(registerDTO.getPassword().getBytes())));
        user.setNickname(registerDTO.getNickname());
        user.setPhone(registerDTO.getPhone());
        user.setEmail(registerDTO.getEmail());
        user.setUserType("admin"); // 管理员注册

        // 自动生成 createTime 和 updateTime（通过 @PrePersist 注解）
        // 主键 ID 由 MyBatis-Plus 自动生成，无需手动设置

        return userRepository.save(user);
    }

    /**
     * 用户登录
     */
    public LoginVO userLogin(LoginDTO loginDTO) {
        try {
            // 1. 检查用户是否存在
            if (!userRepository.existsByAccount(loginDTO.getAccount())) {
                return createFailedLoginVO("用户不存在");
            }

            // 2. 获取用户信息（确保返回类型正确）
            Optional<User> userOptional = userRepository.findByAccount(loginDTO.getAccount());
            User user = userOptional.orElseThrow(() -> new IllegalArgumentException("用户不存在"));

            // 3. 验证密码
            String encryptedPassword = DigestUtils.md5DigestAsHex(loginDTO.getPassword().getBytes());
            if (!Objects.equals(user.getPassword(), encryptedPassword)) {
                return createFailedLoginVO("密码错误");
            }

            // 4. 生成 JWT
            return JwtUtil.loginStatus(user);
        } catch (IllegalArgumentException e) {
            return createFailedLoginVO(e.getMessage());
        } catch (Exception e) {
            log.error("登录异常", e);
            return createFailedLoginVO("登录失败，请稍后重试");
        }
    }

    private LoginVO createFailedLoginVO(String errorMsg) {
        LoginVO vo = new LoginVO();
        vo.setSuccess(false);
        vo.setErrorMsg(errorMsg);
        return vo;
    }

    /**
     * 管理员获取用户列表（分页可根据实际情况实现）
     */
    public PageVO<User> getUserListForAdmin(GetUserListForAdminDTO dto) {
        // 构建查询条件
        Specification<User> spec = (root, query, cb) -> {
            var predicates = new ArrayList<Predicate>();
            if (dto.getNickname() != null) {
                predicates.add(cb.like(root.get("nickname"), "%" + dto.getNickname() + "%"));
            }
            if (dto.getUserType() != null) {
                predicates.add(cb.equal(root.get("userType"), dto.getUserType()));
            }
            if (dto.getPhone() != null) {
                predicates.add(cb.like(root.get("phone"), "%" + dto.getPhone() + "%"));
            }
            query.orderBy(cb.desc(root.get("createTime")));
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        // 处理分页参数（Spring Data JPA 的 PageRequest 从0开始）
        int page = dto.getPageNum() != null ? dto.getPageNum() - 1 : 0;
        int size = dto.getPageSize() != null ? dto.getPageSize() : 10;
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createTime"));

        // 执行分页查询
        Page<User> userPage = userRepository.findAll(spec, pageRequest);

        // 转换为自定义 PageVO
        PageVO<User> vo = new PageVO<>();
        vo.setRecords(userPage.getContent());     // 设置数据列表（使用records）
        vo.setTotal(userPage.getTotalElements()); // 总记录数
        vo.setPageNum((long) (page + 1));         // 当前页（转换为从1开始）
        vo.setPageSize((long) size);              // 每页大小
        vo.setPages((long) userPage.getTotalPages()); // 总页数
        vo.setHasNext(userPage.hasNext());        // 是否有下一页
        vo.setHasPrevious(userPage.hasPrevious()); // 是否有上一页

        return vo;
    }

    /**
     * 查询所有用户
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * 根据ID删除用户
     */
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    /**
     * 根据ID查询用户
     */
    public User getById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public boolean updateById(User user) {
        if (user.getId() == null) return false;
        if (!userRepository.existsById(user.getId())) return false;
        userRepository.save(user);
        return true;
    }
}