// System projects built alongside the Winter Arc plan.
//
// Projects don't have their own calendar. Each one is anchored to plan days:
//   startDay / endDay  -> the dates come from the live schedule (they move when you skip,
//                         pause or reschedule days).
//   milestones[].day   -> the plan day whose lecture unlocks that step.
// GateKeeper is the course's own capstone and its videos come after lecture #40 (Day 97),
// so it is anchored to the end of the plan with `afterPlan` study days.
//
// Stack matches the lecture code: Java 21, Spring Boot 4.x, jakarta.* packages, MySQL.

export const SYSTEM_PROJECTS = [
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'proj-1',
    title: 'Employee Directory REST API',
    tagline: 'Your first complete, layered Spring Boot API: CRUD, soft delete, DTOs, validation and clean error responses.',
    difficulty: 'Intermediate',
    category: 'REST API & Spring Data JPA',
    startDay: 68,
    endDay: 75,
    estimatedHours: '8–10 hours spread over the window',
    overview:
      'Build the backend for a company employee directory. HR staff can add employees, look them up, update their details, filter by department and remove people who leave. Removal is a soft delete: the row stays in MySQL with deleted = true so history is never lost, and deleted employees can be restored. By the end, the API validates every input, never exposes the entity directly, and returns consistent JSON errors with the right HTTP status codes.',
    learningGoals: [
      'Structure an app as Controller → Service → Repository with constructor injection',
      'Map an entity to MySQL with Spring Data JPA and write derived query methods',
      'Implement soft delete and restore without losing data',
      'Separate request/response DTOs from the entity and validate input with jakarta.validation',
      'Centralise error handling with @RestControllerAdvice and return correct status codes',
      'Run the same code with dev and prod configuration using profiles'
    ],
    prerequisites: [
      { day: 68, topic: 'CRUD project architecture (layers, REST mapping)' },
      { day: 69, topic: 'MySQL + Spring Data JPA methods' },
      { day: 70, topic: 'Soft delete with derived queries' },
      { day: 73, topic: 'DTOs & validation' },
      { day: 74, topic: 'Exception handling' },
      { day: 75, topic: 'Profiles & YAML' }
    ],
    milestones: [
      {
        day: 68,
        title: 'Skeleton and layers',
        tasks: [
          'Create the project with spring-boot-starter-webmvc, spring-boot-starter-data-jpa, spring-boot-starter-validation and mysql-connector-j',
          'Create packages: controller, service, repository, entity, dto, exception',
          'Add EmployeeController with the 5 endpoints below returning hard-coded data, so the URL design is fixed before the database exists'
        ]
      },
      {
        day: 69,
        title: 'Persist to MySQL',
        tasks: [
          'Create the employee_db schema and configure spring.datasource.* and ddl-auto=update',
          'Write the Employee entity and EmployeeRepository extends JpaRepository<Employee, Long>',
          'Implement create, get-by-id, list and update in EmployeeService using the repository',
          'Add derived queries: findByEmail and findByDepartmentIgnoreCase'
        ]
      },
      {
        day: 70,
        title: 'Soft delete and restore',
        tasks: [
          'Add a Boolean deleted column (default false)',
          'DELETE sets deleted = true instead of removing the row',
          'All reads use findByDeletedIsFalse / findByIdAndDeletedIsFalse so deleted employees disappear from the API',
          'Add PATCH /api/v1/employees/{id}/restore to bring an employee back'
        ]
      },
      {
        day: 73,
        title: 'DTOs and validation',
        tasks: [
          'Create CreateEmployeeRequest, UpdateEmployeeRequest and EmployeeResponse records; controllers never accept or return the entity',
          'Validate: names not blank, valid email, salary positive, department not blank',
          'Put @Valid on every @RequestBody'
        ]
      },
      {
        day: 74,
        title: 'Professional error handling',
        tasks: [
          'Throw ResourceNotFoundException (→ 404) and DuplicateEmailException (→ 409) from the service',
          'Write a GlobalExceptionHandler that returns { timestamp, status, error, message, path }',
          'Validation errors return 400 with every failing message per field (a field can fail more than one rule)',
          'POST returns 201 with a Location header; DELETE returns 204'
        ]
      },
      {
        day: 75,
        title: 'Profiles and wrap-up',
        tasks: [
          'Move config to application.yml; add application-dev.yml (show-sql on, local DB) and application-prod.yml (show-sql off, credentials from environment variables)',
          'Run once with --spring.profiles.active=prod to prove it works',
          'Write a README with setup steps and example requests'
        ]
      }
    ],
    requirements: [
      'Email is unique among employees; creating or updating to an existing email returns 409 Conflict',
      'GET /api/v1/employees supports an optional ?department= filter (case-insensitive)',
      'Soft-deleted employees never appear in any GET response, and GET by id on one returns 404',
      'Restoring an employee that is not deleted is a no-op that still returns 200 with the employee',
      'Salary is a BigDecimal (money must not use double)',
      'No endpoint accepts or returns the JPA entity; only DTOs cross the API boundary'
    ],
    techStack: ['Java 21', 'Spring Boot 4.x', 'Spring Data JPA', 'MySQL 8', 'jakarta.validation', 'Maven'],
    architecture: `
  [ Postman / curl ]
          │  JSON over HTTP
          ▼
  [ EmployeeController ]   @RestController, @Valid DTOs, status codes
          │
          ▼
  [ EmployeeService ]      business rules: unique email, soft delete, restore
          │
          ▼
  [ EmployeeRepository ]   JpaRepository + derived queries
          │
          ▼
  [ MySQL: employees ]     row kept on delete (deleted = 1)

  [ GlobalExceptionHandler ] turns exceptions into consistent JSON errors`,
    databaseSchema: `-- Hibernate can create this with ddl-auto=update; shown here so you know the target
CREATE TABLE employees (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name  VARCHAR(50)    NOT NULL,
    last_name   VARCHAR(50)    NOT NULL,
    email       VARCHAR(120)   NOT NULL UNIQUE,
    department  VARCHAR(60)    NOT NULL,
    salary      DECIMAL(12, 2) NOT NULL,
    deleted     BOOLEAN        NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
);`,
    apiEndpoints: [
      { method: 'POST', path: '/api/v1/employees', desc: 'Create an employee (validated). 409 if email exists.', status: '201 Created' },
      { method: 'GET', path: '/api/v1/employees?department=Engineering', desc: 'List active employees, optionally filtered by department', status: '200 OK' },
      { method: 'GET', path: '/api/v1/employees/{id}', desc: 'Get one active employee', status: '200 OK / 404' },
      { method: 'PUT', path: '/api/v1/employees/{id}', desc: 'Update name, department and salary (validated)', status: '200 OK / 404 / 409' },
      { method: 'DELETE', path: '/api/v1/employees/{id}', desc: 'Soft delete (sets deleted = true)', status: '204 No Content / 404' },
      { method: 'PATCH', path: '/api/v1/employees/{id}/restore', desc: 'Restore a soft-deleted employee', status: '200 OK / 404' }
    ],
    sampleRequest: `POST /api/v1/employees
Content-Type: application/json

{
  "firstName": "Riya",
  "lastName": "Sharma",
  "email": "riya.sharma@acme.dev",
  "department": "Engineering",
  "salary": 85000.00
}

→ 201 Created
Location: /api/v1/employees/1
{ "id": 1, "firstName": "Riya", "lastName": "Sharma", "email": "riya.sharma@acme.dev",
  "department": "Engineering", "salary": 85000.00 }`,
    starterCodeSnippets: [
      {
        filename: 'Employee.java',
        code: `package com.acme.directory.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "employees")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String firstName;

    @Column(nullable = false, length = 50)
    private String lastName;

    @Column(nullable = false, unique = true, length = 120)
    private String email;

    @Column(nullable = false, length = 60)
    private String department;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal salary;

    @Column(nullable = false)
    private Boolean deleted = false;

    // getters and setters
}`
      },
      {
        filename: 'EmployeeRepository.java',
        code: `package com.acme.directory.repository;

import com.acme.directory.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    List<Employee> findByDeletedIsFalse();

    List<Employee> findByDepartmentIgnoreCaseAndDeletedIsFalse(String department);

    Optional<Employee> findByIdAndDeletedIsFalse(Long id);

    boolean existsByEmail(String email);
}`
      },
      {
        filename: 'CreateEmployeeRequest.java',
        code: `package com.acme.directory.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record CreateEmployeeRequest(
        @NotBlank(message = "firstName is required") String firstName,
        @NotBlank(message = "lastName is required") String lastName,
        @NotBlank(message = "email is required") @Email(message = "email must be valid") String email,
        @NotBlank(message = "department is required") String department,
        @NotNull(message = "salary is required") @Positive(message = "salary must be positive") BigDecimal salary
) {}`
      },
      {
        filename: 'GlobalExceptionHandler.java',
        code: `package com.acme.directory.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.time.Instant;
import java.util.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    public record ErrorResponse(Instant timestamp, int status, String error, String message, String path) {}

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> notFound(ResourceNotFoundException ex, HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage(), req);
    }

    @ExceptionHandler(DuplicateEmailException.class)
    public ResponseEntity<ErrorResponse> duplicate(DuplicateEmailException ex, HttpServletRequest req) {
        return build(HttpStatus.CONFLICT, ex.getMessage(), req);
    }

    // A field can break several rules at once, so collect a LIST of messages per field
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, List<String>>> invalid(MethodArgumentNotValidException ex) {
        Map<String, List<String>> errors = new TreeMap<>();
        ex.getBindingResult().getFieldErrors().forEach(fe ->
                errors.computeIfAbsent(fe.getField(), k -> new ArrayList<>()).add(fe.getDefaultMessage()));
        return ResponseEntity.badRequest().body(errors);
    }

    private ResponseEntity<ErrorResponse> build(HttpStatus status, String message, HttpServletRequest req) {
        ErrorResponse body = new ErrorResponse(Instant.now(), status.value(),
                status.getReasonPhrase(), message, req.getRequestURI());
        return ResponseEntity.status(status).body(body);
    }
}`
      }
    ],
    testingSteps: [
      'POST a valid employee → 201, Location header points to /api/v1/employees/{id}',
      'POST the same email again → 409 with the JSON error body',
      'POST with empty firstName and salary -5 → 400 listing both fields',
      'GET /api/v1/employees?department=engineering (lower case) → the employee is listed',
      'DELETE it → 204; GET by id → 404; check MySQL: the row still exists with deleted = 1',
      'PATCH /restore → 200; it appears in the list again',
      'Run with --spring.profiles.active=prod and confirm SQL logging is off'
    ],
    stretchGoals: [
      'After Day 87 (JPA relationships): turn department into its own Department entity with @ManyToOne',
      'After Day 89: add paging and sorting to the list endpoint with Pageable',
      'After Day 97: write a @WebMvcTest for the controller and a Mockito test for the service'
    ],
    definitionOfDone: [
      'All 6 endpoints behave exactly as specified, including status codes',
      'No entity is exposed; every request body is validated',
      'Every error response has the same JSON shape',
      'App starts with both dev and prod profiles',
      'README explains how to run it and shows example requests'
    ]
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'proj-2',
    title: 'Link Shortener with Click Analytics',
    tagline: 'A bit.ly-style service that puts Hibernate, JPA relationships, Spring Data paging and transactions to real use.',
    difficulty: 'Intermediate–Advanced',
    category: 'JPA, Hibernate & Transactions',
    startDay: 85,
    endDay: 91,
    estimatedHours: '10–12 hours spread over the window',
    overview:
      'Users submit a long URL and get back a short code such as q0V. Visiting /r/q0V redirects (HTTP 302) to the original URL and records the click. Links can expire. An analytics endpoint shows total clicks and the most recent visits with paging. The project is designed around what Days 85–91 teach: entities and the persistence context, a one-to-many relationship between links and their clicks, lazy loading without N+1 queries, Spring Data paging, and transactions that keep the click counter correct under concurrent traffic.',
    learningGoals: [
      'Use the persistence context and dirty checking deliberately (assigning the short code after the INSERT)',
      'Model a one-to-many relationship (Link → ClickEvent) with the correct owning side and lazy loading',
      'Avoid the N+1 problem when listing data',
      'Use derived queries, @Query/@Modifying updates and Pageable from Spring Data JPA',
      'Choose transaction boundaries so a redirect never loses a click or leaves half-written data'
    ],
    prerequisites: [
      { day: 85, topic: 'Hibernate fundamentals: entities & mapping' },
      { day: 86, topic: 'Persistence context, dirty checking, flush' },
      { day: 87, topic: 'JPA relationships' },
      { day: 88, topic: 'Cascading, lazy loading & N+1' },
      { day: 89, topic: 'Spring Data JPA: queries & pagination' },
      { day: 90, topic: 'Transactions & @Transactional' },
      { day: 91, topic: 'Propagation & isolation' }
    ],
    milestones: [
      {
        day: 85,
        title: 'Link entity and create endpoint',
        tasks: [
          'New Spring Boot project (webmvc, data-jpa, validation, mysql-connector-j)',
          'Link entity: id, shortCode (unique), originalUrl (up to 2048 chars), clickCount, createdAt, expiresAt',
          'POST /api/links validates the URL (must start with http:// or https://) and saves it'
        ]
      },
      {
        day: 86,
        title: 'Short codes via dirty checking',
        tasks: [
          'Write the Base62 encoder (below) and a unit test: encode(125) = "21", encode(100001) = "q0V"',
          'In one @Transactional method: save the link (INSERT gives the id), then setShortCode(Base62.encode(id + 100_000)); let dirty checking issue the UPDATE',
          'Turn on spring.jpa.show-sql and confirm you see exactly one INSERT and one UPDATE'
        ]
      },
      {
        day: 87,
        title: 'Record clicks',
        tasks: [
          'ClickEvent entity with @ManyToOne(fetch = LAZY) to Link (owning side) and clickedAt / userAgent',
          'Optional inverse side on Link: @OneToMany(mappedBy = "link")',
          'GET /r/{code} saves a ClickEvent and responds 302 with a Location header'
        ]
      },
      {
        day: 88,
        title: 'List without N+1',
        tasks: [
          'GET /api/links returns code, URL and clickCount for every link',
          'Show in the SQL log that listing links runs ONE query (it must not touch the lazy clicks collection)',
          'Write down what would trigger N+1 here and how @EntityGraph or a fetch join would fix it if you did need clicks'
        ]
      },
      {
        day: 89,
        title: 'Paging and analytics',
        tasks: [
          'GET /api/links?page=0&size=20&sort=createdAt,desc using Pageable and Page<LinkResponse>',
          'GET /api/links/{code}/stats returns totalClicks plus the 10 most recent clicks (ClickEventRepository with Pageable)',
          'Add the @Modifying @Query that increments click_count in the database'
        ]
      },
      {
        day: 90,
        title: 'Transactions around the redirect',
        tasks: [
          'Make "increment counter + save ClickEvent" one @Transactional service method',
          'Throw from inside it on purpose and verify neither the counter nor the click was written (rollback)',
          'Expired links (expiresAt in the past) return 410 Gone and record nothing'
        ]
      },
      {
        day: 91,
        title: 'Correct under concurrency',
        tasks: [
          'Explain why link.setClickCount(link.getClickCount() + 1) can lose updates with two simultaneous requests, and why UPDATE ... SET click_count = click_count + 1 does not',
          'Fire 50 parallel requests (e.g. a small ExecutorService program or `ab -n 50 -c 10`) and confirm clickCount = 50 and 50 ClickEvent rows',
          'Write a README section on the transaction design'
        ]
      }
    ],
    requirements: [
      'Short codes are unique and contain only 0-9, a-z, A-Z',
      'GET /r/{code} for an unknown code returns 404 JSON, never a redirect',
      'Expired links return 410 Gone',
      'clickCount always equals the number of ClickEvent rows for that link, even under concurrent clicks',
      'The list endpoint is paginated and runs a constant number of SQL queries regardless of page size',
      'Redirect path is /r/{code} so it can never clash with /api/** routes'
    ],
    techStack: ['Java 21', 'Spring Boot 4.x', 'Spring Data JPA', 'Hibernate', 'MySQL 8', 'jakarta.validation'],
    architecture: `
  POST /api/links ──► LinkController ──► LinkService.create()  @Transactional
                                              │ save()  → INSERT (id assigned)
                                              │ setShortCode(base62(id))
                                              ▼ commit → dirty check → UPDATE
  GET /r/{code} ───► RedirectController ─► LinkService.resolveAndRecordClick()  @Transactional
                                              │ findByShortCode
                                              │ incrementClickCount  (UPDATE ... +1)
                                              │ save(ClickEvent)
                                              ▼ commit (all or nothing)
                         302 Found, Location: <originalUrl>

  [ links ] 1 ──────< [ click_events ]   (click_events.link_id is the owning FK)`,
    databaseSchema: `CREATE TABLE links (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    short_code    VARCHAR(12)   UNIQUE,
    original_url  VARCHAR(2048) NOT NULL,
    click_count   BIGINT        NOT NULL DEFAULT 0,
    created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at    TIMESTAMP     NULL
);

CREATE TABLE click_events (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    link_id     BIGINT       NOT NULL,
    clicked_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_agent  VARCHAR(512),
    CONSTRAINT fk_click_link FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE,
    INDEX idx_click_link_time (link_id, clicked_at)
);`,
    apiEndpoints: [
      { method: 'POST', path: '/api/links', desc: 'Shorten a URL. Body: { "url": "...", "expiresAt": optional ISO time }', status: '201 Created' },
      { method: 'GET', path: '/r/{code}', desc: 'Redirect to the original URL and record the click', status: '302 Found / 404 / 410' },
      { method: 'GET', path: '/api/links?page=0&size=20', desc: 'Paginated list of links with click counts', status: '200 OK' },
      { method: 'GET', path: '/api/links/{code}/stats', desc: 'Total clicks + 10 most recent click events', status: '200 OK / 404' },
      { method: 'DELETE', path: '/api/links/{code}', desc: 'Delete a link and its click history (cascade)', status: '204 No Content' }
    ],
    sampleRequest: `POST /api/links
{ "url": "https://docs.spring.io/spring-data/jpa/reference/" }

→ 201 Created
{ "code": "q0V", "shortUrl": "http://localhost:8080/r/q0V",
  "originalUrl": "https://docs.spring.io/spring-data/jpa/reference/", "clickCount": 0 }

GET /r/q0V
→ 302 Found
Location: https://docs.spring.io/spring-data/jpa/reference/`,
    starterCodeSnippets: [
      {
        filename: 'Base62.java',
        code: `package com.acme.shortener.util;

public final class Base62 {

    private static final String ALPHABET =
            "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    private Base62() {}

    /** encode(125) = "21", encode(100001) = "q0V" */
    public static String encode(long value) {
        if (value < 0) throw new IllegalArgumentException("value must be >= 0");
        if (value == 0) return "0";
        StringBuilder sb = new StringBuilder();
        while (value > 0) {
            sb.append(ALPHABET.charAt((int) (value % 62)));
            value /= 62;
        }
        return sb.reverse().toString();
    }
}`
      },
      {
        filename: 'ClickEvent.java',
        code: `package com.acme.shortener.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "click_events")
public class ClickEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Owning side of the relationship: this table holds the foreign key
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "link_id")
    private Link link;

    @Column(nullable = false)
    private Instant clickedAt = Instant.now();

    @Column(length = 512)
    private String userAgent;

    protected ClickEvent() {}            // for JPA

    public ClickEvent(Link link, String userAgent) {
        this.link = link;
        this.userAgent = userAgent;
    }

    // getters
}`
      },
      {
        filename: 'LinkRepository.java',
        code: `package com.acme.shortener.repository;

import com.acme.shortener.entity.Link;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface LinkRepository extends JpaRepository<Link, Long> {

    Optional<Link> findByShortCode(String shortCode);

    // Atomic in the database: no lost updates when two clicks arrive together.
    // Must run inside a transaction (see LinkService).
    @Modifying
    @Query("update Link l set l.clickCount = l.clickCount + 1 where l.id = :id")
    int incrementClickCount(@Param("id") Long id);
}`
      },
      {
        filename: 'LinkService.java',
        code: `package com.acme.shortener.service;

import com.acme.shortener.entity.ClickEvent;
import com.acme.shortener.entity.Link;
import com.acme.shortener.exception.LinkExpiredException;
import com.acme.shortener.exception.ResourceNotFoundException;
import com.acme.shortener.repository.ClickEventRepository;
import com.acme.shortener.repository.LinkRepository;
import com.acme.shortener.util.Base62;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;

@Service
public class LinkService {

    private static final long CODE_OFFSET = 100_000;   // avoids 1-character codes

    private final LinkRepository links;
    private final ClickEventRepository clicks;

    public LinkService(LinkRepository links, ClickEventRepository clicks) {
        this.links = links;
        this.clicks = clicks;
    }

    @Transactional
    public Link create(String url, Instant expiresAt) {
        Link link = new Link(url, expiresAt);
        links.save(link);                                   // IDENTITY: INSERT runs now, id assigned
        link.setShortCode(Base62.encode(link.getId() + CODE_OFFSET));
        return link;                                        // dirty checking → UPDATE at commit
    }

    @Transactional
    public String resolveAndRecordClick(String code, String userAgent) {
        Link link = links.findByShortCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("No link for code " + code));
        if (link.getExpiresAt() != null && link.getExpiresAt().isBefore(Instant.now())) {
            throw new LinkExpiredException(code);            // handler maps this to 410 Gone
        }
        links.incrementClickCount(link.getId());
        clicks.save(new ClickEvent(link, userAgent));
        return link.getOriginalUrl();                        // both writes commit together
    }
}`
      },
      {
        filename: 'RedirectController.java',
        code: `package com.acme.shortener.controller;

import com.acme.shortener.service.LinkService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;

@RestController
public class RedirectController {

    private final LinkService linkService;

    public RedirectController(LinkService linkService) {
        this.linkService = linkService;
    }

    @GetMapping("/r/{code}")
    public ResponseEntity<Void> redirect(@PathVariable String code,
                                         @RequestHeader(value = "User-Agent", required = false) String userAgent) {
        String target = linkService.resolveAndRecordClick(code, userAgent);
        return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(target)).build();
    }
}`
      }
    ],
    testingSteps: [
      'Unit test Base62: encode(0) = "0", encode(61) = "Z", encode(62) = "10", encode(125) = "21"',
      'POST a URL → 201 with a code; the SQL log shows one INSERT then one UPDATE',
      'curl -i http://localhost:8080/r/<code> → 302 with the right Location header',
      'POST with url "ftp://x" or "hello" → 400',
      'Create a link with expiresAt in the past → /r/<code> returns 410 and no click is recorded',
      'GET /api/links?page=0&size=2 → page metadata (totalElements, totalPages) is correct; SQL log shows no per-link click queries',
      'Run 50 concurrent requests against /r/<code> → stats show exactly 50 clicks and 50 events'
    ],
    stretchGoals: [
      'After Day 76–78: add a request-ID filter and an interceptor that logs redirect latency',
      'Custom alias: let the user choose a code (check uniqueness, 409 on conflict)',
      'Not in the course: cache code → URL lookups in Redis with a TTL (Spring Data Redis, StringRedisTemplate)'
    ],
    definitionOfDone: [
      'All endpoints match the spec, including 404 and 410 cases',
      'Concurrency test passes: clickCount equals the number of click events',
      'Listing links runs a constant number of queries (shown in the SQL log)',
      'Transaction boundaries are documented in the README'
    ]
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'proj-3',
    title: 'Secure Notes API with JWT',
    tagline: 'Register, log in, get a JWT and manage notes that only you can see, plus tests that prove the security works.',
    difficulty: 'Advanced',
    category: 'Security & JWT Auth',
    startDay: 92,
    endDay: 97,
    estimatedHours: '10–12 hours spread over the window',
    overview:
      'A personal notes service secured end to end. Users register with a username and password (stored as a BCrypt hash), log in to receive a short-lived JWT, and send it as a Bearer token on every request. Each user can create, read, update and delete only their own notes; another user\'s note behaves as if it does not exist (404). Admins can list all users. The security setup follows the course exactly: DaoAuthenticationProvider with a database UserDetailsService, Spring\'s JwtEncoder/JwtDecoder with an HS256 key, a stateless session and an authorities claim. Finally you prove it with Mockito and MockMvc tests.',
    learningGoals: [
      'Understand the security filter chain and how authentication and authorisation are decided',
      'Store passwords safely with BCrypt and load users from MySQL',
      'Issue and validate JWTs with Spring Security\'s resource-server support (no hand-written token filter)',
      'Enforce ownership in the service layer and roles in the filter chain',
      'Write unit tests with Mockito and controller tests with MockMvc, including authenticated requests'
    ],
    prerequisites: [
      { day: 92, topic: 'Spring Security fundamentals' },
      { day: 93, topic: 'DB authentication & password security' },
      { day: 94, topic: 'Authentication internals & login flow' },
      { day: 95, topic: 'JWT & stateless security' },
      { day: 96, topic: 'OAuth 2.0 / Google login (stretch)' },
      { day: 97, topic: 'Testing with JUnit 5, Mockito & MockMvc' }
    ],
    milestones: [
      {
        day: 92,
        title: 'Secure by default',
        tasks: [
          'Create the project (webmvc, data-jpa, validation, mysql-connector-j, security, security-oauth2-resource-server, plus the matching -test starters)',
          'Add a Note entity and a temporary NoteController; observe that everything now needs login',
          'Explain in the README what DelegatingFilterProxy and the SecurityFilterChain did with your request'
        ]
      },
      {
        day: 93,
        title: 'Users in the database',
        tasks: [
          'User and Role entities (@ManyToMany, roles fetched with the user) and repositories',
          'POST /api/auth/register: validate input, reject duplicate usernames with 409, hash with BCrypt, give ROLE_USER',
          'Seed ROLE_USER and ROLE_ADMIN at startup (CommandLineRunner) so registration never fails on an empty database',
          'CustomUserDetailsService loads users by username'
        ]
      },
      {
        day: 94,
        title: 'Login flow',
        tasks: [
          'Register DaoAuthenticationProvider + ProviderManager beans as in the lecture',
          'POST /api/auth/login calls authenticationManager.authenticate(...); wrong password → 401 JSON, never 500'
        ]
      },
      {
        day: 95,
        title: 'Issue and validate JWTs',
        tasks: [
          'SecretKey bean from a Base64 jwt.secret read from an environment variable (never commit the real secret)',
          'JwtService issues tokens with issuer, subject, 15-minute expiry and an authorities claim',
          'SecurityFilterChain: CSRF off, STATELESS, permitAll for register/login, oauth2ResourceServer(jwt) with the authorities converter',
          'Notes CRUD under /api/notes uses the JWT subject as the owner; another user\'s note returns 404',
          'GET /api/admin/users requires ROLE_ADMIN'
        ]
      },
      {
        day: 96,
        title: 'Optional: Google login',
        tasks: [
          'Stretch only: add oauth2Login with Google and link the Google account to a local user by provider + sub'
        ]
      },
      {
        day: 97,
        title: 'Prove it with tests',
        tasks: [
          'NoteServiceTest with @ExtendWith(MockitoExtension.class): owner can read, non-owner gets ResourceNotFoundException',
          'NoteControllerTest with @WebMvcTest: 401 without a token, 200 with jwt(), 400 for an invalid body',
          'Run mvn test and keep it green'
        ]
      }
    ],
    requirements: [
      'Passwords are never stored or logged in plain text; responses never contain the hash',
      'Usernames are unique (409 on duplicate); passwords at least 8 characters',
      'Tokens expire after 15 minutes; an expired or tampered token gets 401',
      'A user can only see and change their own notes; foreign note ids return 404 (not 403, to avoid leaking existence)',
      'Only ROLE_ADMIN can call /api/admin/**; others get 403',
      'The JWT secret comes from configuration/environment, not source code'
    ],
    techStack: ['Java 21', 'Spring Boot 4.x', 'Spring Security 7', 'OAuth2 Resource Server (JwtEncoder/JwtDecoder)', 'BCrypt', 'MySQL 8', 'JUnit 5 + Mockito + MockMvc'],
    architecture: `
  POST /api/auth/register ─► AuthService ─► BCrypt hash ─► users / user_roles
  POST /api/auth/login ────► AuthenticationManager ─► DaoAuthenticationProvider
                                  │                     └─ CustomUserDetailsService (MySQL)
                                  ▼
                             JwtService.generateToken()  (HS256, iss, sub, exp, authorities)

  Any other request:
  Authorization: Bearer <jwt>
          │
          ▼
  BearerTokenAuthenticationFilter ─► JwtDecoder (signature, issuer, expiry)
          │                          └─ JwtAuthenticationConverter (authorities claim)
          ▼
  authorizeHttpRequests rules ─► NoteController ─► NoteService (owner = jwt.subject)`,
    databaseSchema: `CREATE TABLE users (
    id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    username  VARCHAR(50)  NOT NULL UNIQUE,
    password  VARCHAR(100) NOT NULL,          -- BCrypt hash (60 chars)
    enabled   BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE roles (
    id    BIGINT AUTO_INCREMENT PRIMARY KEY,
    name  VARCHAR(30) NOT NULL UNIQUE         -- ROLE_USER, ROLE_ADMIN
);

CREATE TABLE user_roles (
    user_id  BIGINT NOT NULL,
    role_id  BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE notes (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner       VARCHAR(50)  NOT NULL,         -- username from the JWT subject
    title       VARCHAR(120) NOT NULL,
    content     TEXT,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_notes_owner (owner)
);`,
    apiEndpoints: [
      { method: 'POST', path: '/api/auth/register', desc: 'Create an account (BCrypt hash, ROLE_USER)', status: '201 Created / 400 / 409' },
      { method: 'POST', path: '/api/auth/login', desc: 'Returns { accessToken, tokenType: "Bearer", expiresIn }', status: '200 OK / 401' },
      { method: 'GET', path: '/api/notes', desc: 'List my notes', status: '200 OK / 401' },
      { method: 'POST', path: '/api/notes', desc: 'Create a note owned by me', status: '201 Created / 400 / 401' },
      { method: 'PUT', path: '/api/notes/{id}', desc: 'Update my note', status: '200 OK / 404' },
      { method: 'DELETE', path: '/api/notes/{id}', desc: 'Delete my note', status: '204 No Content / 404' },
      { method: 'GET', path: '/api/admin/users', desc: 'List users (admin only)', status: '200 OK / 403' }
    ],
    sampleRequest: `POST /api/auth/login
{ "username": "aamir", "password": "s3cure-pass" }

→ 200 OK
{ "accessToken": "eyJhbGciOiJIUzI1NiJ9...", "tokenType": "Bearer", "expiresIn": 900 }

GET /api/notes
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
→ 200 OK  [ { "id": 1, "title": "Day 95", "content": "JWT done" } ]`,
    starterCodeSnippets: [
      {
        filename: 'SecurityConfig.java',
        code: `package com.acme.notes.config;

import com.acme.notes.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider(CustomUserDetailsService uds, PasswordEncoder encoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(uds);
        provider.setPasswordEncoder(encoder);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(DaoAuthenticationProvider provider) {
        return new ProviderManager(provider);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   JwtAuthenticationConverter converter) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
                    .requestMatchers("/api/admin/**").hasRole("ADMIN")
                    .anyRequest().authenticated())
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(converter)));
        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter authorities = new JwtGrantedAuthoritiesConverter();
        authorities.setAuthoritiesClaimName("authorities");
        authorities.setAuthorityPrefix("");            // claim already holds ROLE_USER / ROLE_ADMIN
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(authorities);
        return converter;
    }

    @Bean
    public SecretKey jwtSecretKey(@Value("\${jwt.secret}") String base64Secret) {
        return new SecretKeySpec(Base64.getDecoder().decode(base64Secret), "HmacSHA256");
    }

    @Bean
    public JwtEncoder jwtEncoder(SecretKey key) {
        return NimbusJwtEncoder.withSecretKey(key).algorithm(MacAlgorithm.HS256).build();
    }

    @Bean
    public JwtDecoder jwtDecoder(SecretKey key, @Value("\${jwt.issuer}") String issuer) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
        decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer(issuer));
        return decoder;
    }
}`
      },
      {
        filename: 'application.yml',
        code: `spring:
  datasource:
    url: jdbc:mysql://localhost:3306/notes_db
    username: \${DB_USER:root}
    password: \${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: update

jwt:
  issuer: notes-api
  expiry: 900                 # seconds (15 minutes)
  secret: \${JWT_SECRET}       # Base64 of at least 32 random bytes, e.g. openssl rand -base64 32`
      },
      {
        filename: 'NoteController.java',
        code: `package com.acme.notes.controller;

import com.acme.notes.dto.NoteRequest;
import com.acme.notes.dto.NoteResponse;
import com.acme.notes.service.NoteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @GetMapping
    public List<NoteResponse> myNotes(@AuthenticationPrincipal Jwt jwt) {
        return noteService.findAllFor(jwt.getSubject());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NoteResponse create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody NoteRequest request) {
        return noteService.create(jwt.getSubject(), request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        noteService.delete(jwt.getSubject(), id);   // throws ResourceNotFoundException if not the owner
    }
}`
      },
      {
        filename: 'NoteControllerTest.java',
        code: `package com.acme.notes.controller;

import com.acme.notes.config.SecurityConfig;
import com.acme.notes.dto.NoteResponse;
import com.acme.notes.service.CustomUserDetailsService;
import com.acme.notes.service.NoteService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(NoteController.class)
@Import(SecurityConfig.class)
@TestPropertySource(properties = {
        "jwt.secret=MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDE=",   // 32 bytes, test only
        "jwt.issuer=notes-api"
})
class NoteControllerTest {

    @Autowired MockMvc mockMvc;
    @MockitoBean NoteService noteService;
    @MockitoBean CustomUserDetailsService userDetailsService;   // needed by SecurityConfig

    @Test
    void listWithoutTokenIs401() throws Exception {
        mockMvc.perform(get("/api/notes")).andExpect(status().isUnauthorized());
    }

    @Test
    void listWithTokenReturnsOnlyMyNotes() throws Exception {
        when(noteService.findAllFor("alice")).thenReturn(List.of(new NoteResponse(1L, "Day 95", "JWT done")));

        mockMvc.perform(get("/api/notes").with(jwt().jwt(j -> j.subject("alice"))))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$[0].title").value("Day 95"));
    }
}`
      }
    ],
    testingSteps: [
      'Register "alice" and "bob" → 201; register "alice" again → 409; check the users table holds $2a$... hashes',
      'Login with a wrong password → 401 JSON; correct password → token. Paste it into jwt.io and confirm iss, sub, exp and authorities',
      'GET /api/notes with no token → 401; with alice\'s token → 200',
      'Alice creates a note; Bob tries GET/PUT/DELETE on its id → 404',
      'Change one character of the token → 401. Wait past expiry (or set expiry: 60) → 401',
      'Bob calls /api/admin/users → 403; promote Bob to ROLE_ADMIN in the database, log in again → 200',
      'mvn test → all service and controller tests pass'
    ],
    stretchGoals: [
      'Day 96: add Google login with oauth2Login and link accounts by provider + sub',
      'Refresh tokens: a long-lived opaque token stored in the database and rotated on every use (not covered in the course)',
      'Rate-limit /api/auth/login per IP to slow down password guessing'
    ],
    definitionOfDone: [
      'Every endpoint and status code in the spec works',
      'No plain-text passwords anywhere; the JWT secret is not in Git',
      'Ownership and admin rules are enforced and demonstrated',
      'Service and controller tests pass with mvn test'
    ]
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'proj-4',
    title: 'GateKeeper: API Gateway & Management Platform (Course Capstone)',
    tagline: 'The Coder Army capstone: a gateway, a control plane and an analytics service, built in the 5 GateKeeper videos after Lecture #40.',
    difficulty: 'Production / Capstone',
    category: 'Microservices, Redis & Kafka',
    afterPlan: { studyDays: 15 },
    estimatedHours: '25–35 hours, following the 5 project videos',
    overview:
      'GateKeeper is the course\'s own production-style project, taught in the 5 "Building a Production-Grade API Gateway in Spring Boot" videos that follow Lecture #40. It is three Spring Boot (Spring MVC) services. The API Management Service is the control plane: it stores organisations, tenant admins and route definitions in MySQL (Flyway migrations), versions every route change, audits admin actions with AOP and publishes configuration-change events to Kafka. The Smart Gateway Service is the data plane: it loads active routes into memory, validates JWTs locally, enforces route roles, applies Redis rate limits and POST idempotency, rewrites paths and headers, and forwards requests to small demo Catalog/Order services with RestClient and route-specific timeouts. The Analytics Service consumes access events from Kafka and stores them in MongoDB for request statistics. Use the course notes and code in Notes/Spring-Framework-Full-Course/SpringBoot Project … SpringBootProject 06 alongside each video.',
    learningGoals: [
      'Separate the data plane (live traffic) from the control plane (configuration)',
      'Design multi-tenant route configuration with versioning and audit trails',
      'Validate JWTs at the gateway and enforce route-level roles',
      'Implement atomic rate limiting and idempotency with Redis Lua scripts',
      'Propagate configuration changes and access events through Kafka',
      'Run a multi-service system locally with Docker Compose (MySQL, Redis, Kafka, MongoDB)'
    ],
    prerequisites: [
      { day: 76, topic: 'Filters (request flow, correlation IDs)' },
      { day: 79, topic: 'Spring AOP (audit aspect)' },
      { day: 89, topic: 'Spring Data JPA' },
      { day: 91, topic: 'Transactions' },
      { day: 95, topic: 'JWT & stateless security' },
      { day: 97, topic: 'Testing' }
    ],
    milestones: [
      {
        afterPlanDay: 2,
        title: 'Video #1: architecture and service skeletons',
        resource: 'Notes/Spring-Framework-Full-Course/SpringBoot Project',
        tasks: [
          'Read the GateKeeper architecture notes: gateway jobs, data plane vs control plane, what stays out of scope',
          'Create the multi-module project with smart-gateway-service, api-management-service and analytics-service',
          'Each service exposes GET /health; start all three'
        ]
      },
      {
        afterPlanDay: 5,
        title: 'Video #2: management service foundations',
        resource: 'Notes/Spring-Framework-Full-Course/SpringBoot Project 2 and SpringBootProject 03',
        tasks: [
          'Flyway migrations for organisations, roles and management users (MySQL; H2 for tests)',
          'POST /api/auth/login issues JWTs for management users',
          'Platform admin CRUD for organisations and their tenant admin (/api/platform/organizations)'
        ]
      },
      {
        afterPlanDay: 8,
        title: 'Video #3: tenant routes, versions and auditing',
        resource: 'Notes/Spring-Framework-Full-Course/SpringBootProject 04',
        tasks: [
          'Tenant route CRUD (/api/tenant/routes): path, target, allowed methods, auth required, roles, rate limit, timeout, header rules, active flag',
          'Every change stores a RouteConfigurationVersion (/api/tenant/route-versions/{routeId})',
          'AOP audit aspect records admin actions (/api/tenant/audit-records)'
        ]
      },
      {
        afterPlanDay: 11,
        title: 'Video #4: configuration events over Kafka',
        resource: 'Notes/Spring-Framework-Full-Course/SpringBootProject 05',
        tasks: [
          'docker compose up (compose.yaml) for MySQL, Redis, Kafka and MongoDB',
          'Publish GatewayConfigurationChangeEvent to Kafka after route changes commit',
          'Gateway exposes active routes via /api/gateway/routes from management and reloads on events'
        ]
      },
      {
        afterPlanDay: 15,
        title: 'Video #5: the smart gateway',
        resource: 'Notes/Spring-Framework-Full-Course/SpringBootProject 06',
        tasks: [
          'GatewayController catches /** and matches the request against the in-memory RouteRegistry',
          'Validate JWT locally and check route roles; return consistent GatewayErrorResponse bodies',
          'RateLimitService (Redis Lua: INCR + EXPIRE) and IdempotencyService for configured POST routes',
          'Forward with RestClient using per-route timeouts; publish access events for analytics'
        ]
      }
    ],
    requirements: [
      'Live requests never call the management service; routes come from the gateway\'s in-memory registry',
      'Rate limiting is atomic in Redis (one Lua script), keyed per route and client',
      'Repeated POSTs with the same Idempotency-Key return the first result instead of executing twice',
      'Route changes are versioned and every admin action is audited',
      'Gateway errors (no route, 401, 403, 429, upstream timeout) share one JSON shape',
      'Business rules stay in the backend services; the gateway only enforces entry policies'
    ],
    techStack: ['Java 21', 'Spring Boot 4.x (Spring MVC)', 'Spring Security + OAuth2 Resource Server', 'RestClient', 'MySQL + Flyway', 'Redis', 'Apache Kafka', 'MongoDB', 'Spring AOP', 'Docker Compose'],
    architecture: `
                 Clients
                    │
                    ▼
  ┌────────────── Smart Gateway Service (data plane) ──────────────┐
  │ correlation ID → route match (in-memory) → JWT + role check     │
  │ → Redis rate limit → Redis idempotency → path/header rewrite    │
  │ → RestClient forward (per-route timeout) → access event         │
  └───────┬──────────────────────────────┬───────────────────┬──────┘
          ▼                              ▼                   │ Kafka: access events
   Catalog demo service          Order demo service          ▼
                                                     Analytics Service ─► MongoDB
          ▲ Kafka: configuration-change events
          │
  API Management Service (control plane) ─► MySQL (Flyway)
    orgs · tenant admins · routes · route versions · AOP audit records`,
    databaseSchema: `-- Simplified view of the management service tables (the course uses Flyway migrations)
organizations (id, name, slug, status, created_at)
roles (id, name)                                 -- PLATFORM_ADMIN, TENANT_ADMIN
management_users (id, username, password_hash, organization_id, role_id)
api_routes (id, organization_id, path_pattern, target_url, allowed_methods,
            auth_required, required_roles, rate_limit, rate_window_seconds,
            timeout_ms, active, version)
route_header_rules (id, route_id, action, header_name, header_value)
route_configuration_versions (id, route_id, version, snapshot_json, created_at)
control_plane_audit_records (id, actor, action, target, details, created_at)`,
    apiEndpoints: [
      { method: 'POST', path: '/api/auth/login', desc: 'Management login (JWT)', status: '200 OK / 401' },
      { method: 'POST', path: '/api/platform/organizations', desc: 'Platform admin creates an organisation', status: '201 Created' },
      { method: 'POST', path: '/api/platform/organizations/{organizationId}/tenant-admin', desc: 'Create the tenant admin for an organisation', status: '201 Created' },
      { method: 'POST', path: '/api/tenant/routes', desc: 'Tenant admin defines a route and its policies', status: '201 Created' },
      { method: 'PATCH', path: '/api/tenant/routes/{id}/status', desc: 'Activate / deactivate a route', status: '200 OK' },
      { method: 'GET', path: '/api/tenant/route-versions/{routeId}', desc: 'Version history of a route', status: '200 OK' },
      { method: 'GET', path: '/api/tenant/audit-records', desc: 'Audit trail of admin actions', status: '200 OK' },
      { method: 'ANY', path: '/** (gateway)', desc: 'Matched, policy-checked and proxied to the target service', status: 'Proxied / 401 / 403 / 404 / 429 / 504' }
    ],
    sampleRequest: `# Through the gateway, after a route /catalog/** → http://localhost:9001 is configured
GET http://localhost:8080/catalog/products
Authorization: Bearer <jwt>

→ 200 OK (from the catalog service)
X-Correlation-Id: 6f1c…

# 61st request inside the window on a route limited to 60/minute
→ 429 Too Many Requests
{ "status": 429, "error": "RATE_LIMITED", "message": "Rate limit exceeded for route catalog" }`,
    starterCodeSnippets: [
      {
        filename: 'RateLimitService.java',
        code: `package in.coderarmy.gatekeeper.gateway.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class RateLimitService {

    // INCR and EXPIRE run atomically inside Redis: no race between two gateway instances
    private static final String SCRIPT = """
            local current = redis.call('INCR', KEYS[1])
            if current == 1 then
                redis.call('EXPIRE', KEYS[1], ARGV[1])
            end
            return current
            """;

    private final StringRedisTemplate redis;
    private final DefaultRedisScript<Long> script = new DefaultRedisScript<>(SCRIPT, Long.class);

    public RateLimitService(StringRedisTemplate redis) {
        this.redis = redis;
    }

    /** true if this request is within the route's limit for the current window */
    public boolean allow(String routeId, String clientIp, int limit, int windowSeconds) {
        String key = "gk:rl:" + routeId + ":" + clientIp;
        Long count = redis.execute(script, List.of(key), String.valueOf(windowSeconds));
        return count != null && count <= limit;
    }
}`
      }
    ],
    testingSteps: [
      'docker compose up; all three services report UP on /health',
      'Log in as platform admin, create an organisation and its tenant admin',
      'As tenant admin, create a route to the demo catalog service; it appears in the gateway after the Kafka event (no restart)',
      'Call the route through the gateway with and without a JWT → 200 vs 401; with the wrong role → 403',
      'Send more requests than the limit in one window → 429; wait for the window → allowed again',
      'POST twice with the same Idempotency-Key → second call returns the stored result',
      'Stop the target service → gateway returns a consistent 5xx error within the route timeout',
      'Check route versions and audit records for every change you made'
    ],
    stretchGoals: [
      'Add a dashboard endpoint in analytics: requests per route per minute',
      'Add circuit-breaking: stop forwarding to a route after N consecutive upstream failures',
      'Write integration tests for the gateway with MockMvc and an embedded or containerised Redis'
    ],
    definitionOfDone: [
      'All five video milestones are implemented and running together',
      'Rate limiting, idempotency and JWT checks are demonstrated through the gateway',
      'Route changes reach the gateway via Kafka without restarts',
      'A README documents how to start the stack and walk through the scenarios'
    ]
  }
];
