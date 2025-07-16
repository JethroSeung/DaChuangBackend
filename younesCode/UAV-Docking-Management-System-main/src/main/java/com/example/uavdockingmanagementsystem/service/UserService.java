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
        User user = userRepository.findByAccount(loginDTO.getAccount());
        if (user == null) {
            throw new BusinessException("用户不存在，请稍后再试!");
        }
        String password = user.getPassword();
        String md5DigestAsHex = DigestUtils.md5DigestAsHex(loginDTO.getPassword().getBytes());
        if (!md5DigestAsHex.equals(password)) {
            throw new BusinessException("密码错误");
        }
        return JwtUtil.loginStatus(user);
    }

    /**
     * 管理员获取用户列表（分页可根据实际情况实现）
     */
    public PageVO<User> getUserListForAdmin(GetUserListForAdminDTO getUserListForAdminDTO) {
        Specification<User> spec = (root, query, cb) -> {
            var predicates = new java.util.ArrayList<Predicate>();
            if (getUserListForAdminDTO.getNickname() != null) {
                predicates.add(cb.like(root.get("nickname"), "%" + getUserListForAdminDTO.getNickname() + "%"));
            }
            if (getUserListForAdminDTO.getUserType() != null) {
                predicates.add(cb.equal(root.get("userType"), getUserListForAdminDTO.getUserType()));
            }
            if (getUserListForAdminDTO.getPhone() != null) {
                predicates.add(cb.like(root.get("phone"), "%" + getUserListForAdminDTO.getPhone() + "%"));
            }
            query.orderBy(cb.desc(root.get("createTime")));
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        int page = getUserListForAdminDTO.getPageNum() != null ? getUserListForAdminDTO.getPageNum() - 1 : 0;
        int size = getUserListForAdminDTO.getPageSize() != null ? getUserListForAdminDTO.getPageSize() : 10;
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createTime"));
        Page<User> userPage = userRepository.findAll(spec, pageRequest);

        PageVO<User> vo = new PageVO<>();
        vo.setList(userPage.getContent());
        vo.setTotal(userPage.getTotalElements());
        vo.setPageNum((long) (page + 1));
        vo.setPageSize((long) size);
        vo.setPages((long) userPage.getTotalPages());
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