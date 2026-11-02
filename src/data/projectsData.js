export const SYSTEM_PROJECTS = [
  {
    id: 'proj-1',
    title: 'Enterprise Employee & Department CRUD System',
    phase: 'Phase 2: Spring Boot Fundamentals',
    dayRange: 'Days 36–38',
    difficulty: 'Intermediate',
    category: 'REST API & Spring Data JPA',
    description: 'A complete layered enterprise backend web service featuring Controller-Service-Repository architecture, MySQL database integration, soft-delete mechanisms, and derived JPA query methods.',
    techStack: ['Spring Boot 3.3', 'Spring Data JPA', 'MySQL 8', 'Hibernate', 'Maven'],
    architecture: `
      [ HTTP Client / Postman ]
                 │
                 ▼
       [ EmployeeController ] ── (REST Endpoints & HTTP Statuses)
                 │
                 ▼
       [ EmployeeService ]    ── (Business Rules & Soft-Delete Filter)
                 │
                 ▼
     [ EmployeeRepository ]   ── (Spring Data JPA & Derived Queries)
                 │
                 ▼
         [ MySQL Database ]   ── (InnoDB with Soft-Delete is_deleted Flag)
    `,
    databaseSchema: `CREATE TABLE departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE employees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    salary DOUBLE NOT NULL,
    department_id BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);`,
    apiEndpoints: [
      { method: 'POST', path: '/api/v1/employees', desc: 'Create employee record', status: '201 Created' },
      { method: 'GET', path: '/api/v1/employees', desc: 'Get all active (non-deleted) employees', status: '200 OK' },
      { method: 'GET', path: '/api/v1/employees/{id}', desc: 'Get employee by ID', status: '200 OK' },
      { method: 'PUT', path: '/api/v1/employees/{id}', desc: 'Update employee details', status: '200 OK' },
      { method: 'DELETE', path: '/api/v1/employees/{id}', desc: 'Soft-delete employee (sets is_deleted = true)', status: '204 No Content' }
    ],
    starterCodeSnippets: [
      {
        filename: 'Employee.java',
        code: `@Entity
@Table(name = "employees")
@SQLDelete(sql = "UPDATE employees SET is_deleted = true WHERE id = ?")
@SQLRestriction("is_deleted = false")
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    private Double salary;
    private Boolean isDeleted = false;

    // Getters, Setters, Constructors
}`
      },
      {
        filename: 'EmployeeService.java',
        code: `@Service
public class EmployeeService {
    private final EmployeeRepository repository;

    public EmployeeService(EmployeeRepository repository) {
        this.repository = repository;
    }

    public Employee create(Employee employee) {
        return repository.save(employee);
    }

    public List<Employee> getAll() {
        return repository.findAll();
    }

    public Employee getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}`
      }
    ],
    testingInstructions: 'Use Postman or cURL to POST /api/v1/employees, verify 201 Created response. DELETE employee and verify that querying /api/v1/employees excludes the record while MySQL database still preserves the row with is_deleted = 1.'
  },
  {
    id: 'proj-2',
    title: 'Stateless JWT Authentication & Security Service',
    phase: 'Phase 2: Spring Boot Advanced',
    dayRange: 'Days 53–54',
    difficulty: 'Advanced',
    category: 'Security & Microservice Auth',
    description: 'A production-grade authentication and authorization service with Spring Security 6, custom UserDetailsService, BCrypt password hashing, OncePerRequestFilter JWT extraction, and Refresh Token rotation.',
    techStack: ['Spring Security 6', 'jjwt (Java JWT)', 'Spring Boot 3', 'BCrypt', 'MySQL'],
    architecture: `
      [ Client Request: Header Authorization: Bearer <token> ]
                                │
                                ▼
                   [ JwtAuthenticationFilter ]
              (Extracts token, validates signature & claims)
                                │
                                ▼
                  [ SecurityContextHolder ]
              (Populates UsernamePasswordAuthenticationToken)
                                │
                                ▼
                  [ SecurityFilterChain Rules ]
              (Permits or rejects endpoint access by Roles)
    `,
    databaseSchema: `CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'ROLE_USER',
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);`,
    apiEndpoints: [
      { method: 'POST', path: '/api/v1/auth/register', desc: 'Register new user with hashed password', status: '201 Created' },
      { method: 'POST', path: '/api/v1/auth/login', desc: 'Authenticate and receive Access & Refresh JWT', status: '200 OK' },
      { method: 'POST', path: '/api/v1/auth/refresh', desc: 'Exchange Refresh Token for new Access Token', status: '200 OK' },
      { method: 'GET', path: '/api/v1/users/profile', desc: 'Access protected user profile (Requires Bearer token)', status: '200 OK / 401 Unauthorized' }
    ],
    starterCodeSnippets: [
      {
        filename: 'SecurityConfig.java',
        code: `@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}`
      }
    ],
    testingInstructions: 'Register a user via /api/v1/auth/register. Log in to receive JWT. Send GET request to /api/v1/users/profile without token (observe 401 Unauthorized), then attach "Authorization: Bearer <token>" and verify 200 OK response.'
  },
  {
    id: 'proj-3',
    title: 'High-Throughput URL Shortener & Redis Caching Service',
    phase: 'Phase 2: Spring Boot & Performance',
    dayRange: 'Days 48–51',
    difficulty: 'Intermediate',
    category: 'System Design & Redis',
    description: 'A scalable web development assignment: design a URL Shortener system with Base62 hash generation, Redis distributed caching for ultra-fast sub-millisecond redirection, and click metrics tracking.',
    techStack: ['Spring Boot 3', 'Spring Data Redis', 'MySQL', 'Base62 Encoding', 'Docker'],
    architecture: `
      [ User Browser / Client ]
                 │
                 ▼
      [ ShortenerController ]
                 │
      ┌──────────┴──────────┐
      ▼                     ▼
[ Redis Cache ]       [ MySQL DB ]
 (Cache Hit: <2ms)     (Cache Miss: Query & Populate Cache)
    `,
    databaseSchema: `CREATE TABLE url_mappings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    short_code VARCHAR(10) NOT NULL UNIQUE,
    original_url TEXT NOT NULL,
    click_count BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL
);`,
    apiEndpoints: [
      { method: 'POST', path: '/api/v1/urls/shorten', desc: 'Generate short URL from long URL', status: '201 Created' },
      { method: 'GET', path: '/{shortCode}', desc: 'Redirect to original URL (302 Found) with Redis lookup', status: '302 Found' },
      { method: 'GET', path: '/api/v1/urls/{shortCode}/analytics', desc: 'Fetch click analytics and access count', status: '200 OK' }
    ],
    starterCodeSnippets: [
      {
        filename: 'UrlService.java',
        code: `@Service
public class UrlService {
    private final StringRedisTemplate redisTemplate;
    private final UrlRepository repository;

    public String resolveUrl(String shortCode) {
        // 1. Check Redis Cache
        String cached = redisTemplate.opsForValue().get("url:" + shortCode);
        if (cached != null) return cached;

        // 2. Query MySQL on Cache Miss
        UrlMapping mapping = repository.findByShortCode(shortCode)
            .orElseThrow(() -> new ResourceNotFoundException("Short URL not found"));

        // 3. Populate Redis Cache with 24-hour TTL
        redisTemplate.opsForValue().set("url:" + shortCode, mapping.getOriginalUrl(), 24, TimeUnit.HOURS);
        return mapping.getOriginalUrl();
    }
}`
      }
    ],
    testingInstructions: 'Shorten a URL. Perform GET request to redirect URL. Check Redis CLI with "GET url:<shortCode>" to confirm sub-millisecond cache hit.'
  },
  {
    id: 'proj-4',
    title: 'The "GateKeeper" Production API Gateway with Microservices, Kafka & Redis',
    phase: 'Phase 3: Capstone System',
    dayRange: 'Days 58 (Videos 41–45)',
    difficulty: 'Production / Hard',
    category: 'Full Microservices Ecosystem',
    description: 'The premier production system directly from Coder Army lectures 41–45. Build a full API Gateway managing route discovery, distributed token-bucket rate limiting via Redis, centralized authentication, and asynchronous audit event streaming to Apache Kafka.',
    techStack: ['Spring Cloud Gateway', 'Apache Kafka', 'Redis (Token Bucket)', 'Spring Security', 'Docker Compose'],
    architecture: `
                         [ Client Requests ]
                                  │
                                  ▼
                ┌───────────────────────────────────┐
                │     "GateKeeper" API Gateway      │
                │ ───────────────────────────────── │
                │ 1. Redis Rate Limiter Filter      │
                │ 2. Centralized JWT Auth Filter    │
                │ 3. Kafka Audit Logging Producer   │
                └─────────────────┬─────────────────┘
                                  │
                  ┌───────────────┼───────────────┐
                  ▼               ▼               ▼
           [ User Service ] [ Order Service ] [ Product Service ]
                                  │
                                  ▼
                          [ Kafka Broker ]
                                  │
                                  ▼
                     [ Analytics Consumer Service ]
    `,
    databaseSchema: `CREATE TABLE gateway_routes (
    id VARCHAR(50) PRIMARY KEY,
    uri VARCHAR(255) NOT NULL,
    path_pattern VARCHAR(255) NOT NULL,
    rate_limit_capacity INT DEFAULT 100,
    rate_limit_refill_tokens INT DEFAULT 10
);

CREATE TABLE api_audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    trace_id VARCHAR(64) NOT NULL,
    client_ip VARCHAR(45) NOT NULL,
    path VARCHAR(255) NOT NULL,
    http_method VARCHAR(10) NOT NULL,
    status_code INT NOT NULL,
    execution_time_ms BIGINT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`,
    apiEndpoints: [
      { method: 'ALL', path: '/api/v1/users/**', desc: 'Route to User Microservice with JWT validation', status: 'Proxied' },
      { method: 'ALL', path: '/api/v1/orders/**', desc: 'Route to Order Microservice with Rate Limiting', status: 'Proxied' },
      { method: 'GET', path: '/actuator/gateway/routes', desc: 'Inspect active gateway routes & filters', status: '200 OK' }
    ],
    starterCodeSnippets: [
      {
        filename: 'RateLimitingFilter.java',
        code: `@Component
public class RateLimitingFilter implements GlobalFilter, Ordered {
    private final StringRedisTemplate redis;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String clientIp = exchange.getRequest().getRemoteAddress().getAddress().getHostAddress();
        String key = "rate:" + clientIp;
        Long count = redis.opsForValue().increment(key);
        if (count != null && count == 1) {
            redis.expire(key, 1, TimeUnit.MINUTES);
        }
        if (count != null && count > 60) {
            exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
            return exchange.getResponse().setComplete();
        }
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() { return -1; }
}`
      }
    ],
    testingInstructions: 'Launch the services via docker-compose up. Fire 70 requests in 1 minute using Apache Bench (ab) or Postman collection to observe rate limiter returning 429 Too Many Requests after 60 requests. Inspect Kafka topics with kafka-console-consumer to verify audit event streaming.'
  }
];

