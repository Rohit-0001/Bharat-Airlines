package com.edutech.config;

import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.edutech.util.JwtRequestFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userDetailsService).passwordEncoder(passwordEncoder);
    }

    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .cors()
            .and()
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeRequests()
                // Open endpoints — no token needed
                .antMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login").permitAll()
                // Admin-only: create / update flights
                .antMatchers(HttpMethod.POST, "/api/flights").hasAuthority("ADMIN")
                .antMatchers(HttpMethod.PUT, "/api/flights/**").hasAuthority("ADMIN")
                // Admin-only: all bookings list
                .antMatchers("/api/booking/bookingList").hasAuthority("ADMIN")
                // Admin-only: assign pilot
                .antMatchers(HttpMethod.POST, "/api/pilot/schedule/**").hasAuthority("ADMIN")
                // Admin or Pilot: update schedule status
                .antMatchers(HttpMethod.PUT, "/api/pilot/schedule/**").hasAnyAuthority("ADMIN", "PILOT")
                // All other API calls require a valid token
                .antMatchers("/api/**").authenticated()
            .and()
            .exceptionHandling()
                // Return 403 when no valid token is provided on a protected endpoint
                .authenticationEntryPoint(
                        (req, res, ex) -> res.sendError(HttpServletResponse.SC_FORBIDDEN))
            .and()
            .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
    }
}