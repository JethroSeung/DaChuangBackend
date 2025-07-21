package com.example.uavdockingmanagementsystem.service;

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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import com.example.uavdockingmanagementsystem.response.BusinessException;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    /**
     * 管理员注册
     */
    public User adminRegister(RegisterDTO registerDTO) {
        User user = userRepository.findByAccount(registerDTO.getAccount());
        if (user != null) {
            throw new BusinessException("账户已存在，请更换账户");
        }
        user = new User();
        BeanUtils.copyProperties(registerDTO, user);
        user.setUserType("admin");
        user.setPassword(DigestUtils.md5DigestAsHex(registerDTO.getPassword().getBytes()));
        userRepository.save(user);
        return user;
    }

    /**
     * 用户登录
     */
     public LoginVO userLogin(LoginDTO loginDTO) {
        try {
            User user = userRepository.findByAccount(loginDTO.getAccount());
            if (user == null) {
                return createFailedLoginVO("用户不存在");
            }

            String password = user.getPassword();
            String md5DigestAsHex = DigestUtils.md5DigestAsHex(loginDTO.getPassword().getBytes());
            if (!md5DigestAsHex.equals(password)) {
                return createFailedLoginVO("密码错误");
            }

            return JwtUtil.loginStatus(user); // 调用修改后的 JwtUtil 方法
        } catch (Exception e) {
            return createFailedLoginVO("登录失败：" + e.getMessage());
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