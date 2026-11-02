export const TOP_INTERVIEW_QUESTIONS = [
  {
    id: 1,
    topic: 'Core Java',
    question: 'How does HashMap work internally in Java 8+ and how are hash collisions handled?',
    answer: 'HashMap uses an array of Node buckets. The bucket index is calculated as (n-1) & hash(key). If a collision occurs, entries are chained using a singly linked list. Once the bucket length reaches TREEIFY_THRESHOLD (8) and the overall array capacity is at least 64 (MIN_TREEIFY_CAPACITY), the linked list converts into a balanced Red-Black Tree (TreeNode), reducing lookup time complexity from O(n) to O(log n). If elements shrink to UNTREEIFY_THRESHOLD (6), it transforms back to a linked list.',
    difficulty: 'Hard',
    tags: ['Collections', 'Data Structures', 'Internals']
  },
  {
    id: 2,
    topic: 'Core Java',
    question: 'What is the contract between equals() and hashCode() and what happens if broken?',
    answer: '1. If two objects are equal according to equals(), their hashCode() values MUST be equal.\n2. If hashCode() values are equal, the objects are NOT required to be equal (hash collision).\nIf broken: inserting custom objects into a HashSet or as keys in a HashMap will cause failures where contains() returns false even though the object exists, or duplicate entries get stored in a Set because the bucket lookup calculates the wrong index.',
    difficulty: 'Medium',
    tags: ['OOP', 'Object Class', 'Collections']
  },
  {
    id: 3,
    topic: 'Core Java',
    question: 'Explain Java Memory Model: Stack vs Heap, Metaspace and Garbage Collection generations.',
    answer: 'Stack stores local variables, method call frames, and primitive values; each thread has its own private stack. Heap stores all dynamically created objects and is shared across threads. Metaspace (native memory, replaced PermGen in Java 8) stores class metadata, static fields, and method bytecode. The Heap is divided into Young Gen (Eden, S0, S1) and Old (Tenured) Gen. Short-lived objects die in Eden during Minor GC; long-lived surviving objects are tenured to Old Gen, collected via Major/Full GC using algorithms like G1 GC or ZGC.',
    difficulty: 'Hard',
    tags: ['JVM', 'Memory', 'Garbage Collection']
  },
  {
    id: 4,
    topic: 'Core Java',
    question: 'What is the difference between volatile, synchronized, and AtomicInteger?',
    answer: '- volatile: Guarantees memory visibility across threads (reads/writes directly to main memory bypassing CPU caches) and prevents instruction reordering. It does NOT guarantee compound atomicity (e.g., count++ is not atomic).\n- synchronized: Guarantees both memory visibility AND mutual exclusion (atomicity) by locking an intrinsic monitor object.\n- AtomicInteger: Provides lock-free, thread-safe atomic operations using hardware-level Compare-And-Swap (CAS) instructions without the performance overhead of thread blocking.',
    difficulty: 'Hard',
    tags: ['Multithreading', 'Concurrency', 'JVM']
  },
  {
    id: 5,
    topic: 'Core Java',
    question: 'What are Virtual Threads in Java 21+ and how do they differ from Platform Threads?',
    answer: 'Platform threads are 1:1 mapped to operating system kernel threads, consuming ~1MB of stack memory and incurring expensive OS context switches, limiting concurrency to a few thousand threads. Virtual Threads (Project Loom) are lightweight user-mode threads managed entirely by the JVM, consuming only ~few hundred bytes. When a Virtual Thread encounters blocking I/O, the JVM unmounts it from the carrier OS thread, allowing millions of concurrent tasks with standard synchronous coding style.',
    difficulty: 'Hard',
    tags: ['Java 21', 'Virtual Threads', 'Concurrency']
  },
  {
    id: 6,
    topic: 'Spring Boot',
    question: 'What does @SpringBootApplication do behind the scenes?',
    answer: '@SpringBootApplication is a meta-annotation composed of three critical annotations:\n1. @SpringBootConfiguration: Indicates that the class provides Spring context configuration (specialized @Configuration).\n2. @EnableAutoConfiguration: Instructs Spring Boot to scan META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports and automatically configure beans based on classpath dependencies and conditional annotations (@ConditionalOnClass, @ConditionalOnMissingBean).\n3. @ComponentScan: Automatically scans the current package and its sub-packages for @Component, @Service, @Repository, and @Controller stereotypes.',
    difficulty: 'Medium',
    tags: ['Spring Core', 'Annotations', 'Boot Internals']
  },
  {
    id: 7,
    topic: 'Spring Boot',
    question: 'What is the Bean Lifecycle in Spring and how can you hook into it?',
    answer: '1. Bean definition loading\n2. Instantiation (constructor execution)\n3. Dependency injection (populating properties)\n4. Aware interfaces (BeanNameAware, ApplicationContextAware)\n5. BeanPostProcessor.postProcessBeforeInitialization()\n6. Initialization callbacks: @PostConstruct, InitializingBean.afterPropertiesSet(), custom init-method\n7. BeanPostProcessor.postProcessAfterInitialization() (proxies created here, e.g. AOP, @Transactional)\n8. Bean is ready for use\n9. Destruction callbacks: @PreDestroy, DisposableBean.destroy(), custom destroy-method on shutdown.',
    difficulty: 'Hard',
    tags: ['Spring Core', 'Beans', 'Lifecycle']
  },
  {
    id: 8,
    topic: 'Spring Boot',
    question: 'What is the N+1 Select Problem in JPA and how do you resolve it?',
    answer: 'The N+1 problem occurs when fetching N parent entities with a lazy-loaded child collection. Executing 1 query to fetch parent records causes N subsequent queries to fetch children as they are accessed in loops, severely degrading performance.\nSolutions:\n1. JOIN FETCH in JPQL: SELECT p FROM Post p JOIN FETCH p.comments\n2. @EntityGraph: Instructs JPA to eagerly fetch specified entity attributes in a single SQL JOIN query.\n3. BatchSize: @BatchSize(size = 25) fetches related collections in batches using SQL IN clause.',
    difficulty: 'Hard',
    tags: ['JPA', 'Hibernate', 'Database Performance']
  },
  {
    id: 9,
    topic: 'Spring Boot',
    question: 'How does @Transactional work and why does it fail on self-invocation?',
    answer: '@Transactional utilizes Spring AOP to wrap the target bean inside a dynamic proxy. When a public method is called from outside the bean, the proxy intercepts the call, opens a database transaction, invokes the target method, and commits or rolls back based on exceptions.\nSelf-invocation pitfall: Calling a @Transactional method from another method inside the SAME class uses "this.method()", bypassing the Spring AOP proxy wrapper completely. To fix: inject the self-bean, extract the method to a separate service bean, or use AspectJ compile-time weaving.',
    difficulty: 'Hard',
    tags: ['Spring Data', 'Transactions', 'AOP']
  },
  {
    id: 10,
    topic: 'Spring Boot',
    question: 'How do you implement stateless JWT authentication with Spring Security 6?',
    answer: '1. Create a SecurityFilterChain bean defining HttpSecurity.\n2. Disable CSRF and session management: sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS)).\n3. Create JwtUtils to generate and parse HMAC-SHA256 signed JWT tokens containing claims and expiration.\n4. Implement JwtAuthenticationFilter extending OncePerRequestFilter to extract Bearer token from the Authorization header, validate signature, build UsernamePasswordAuthenticationToken, and set it in SecurityContextHolder.getContext().setAuthentication().\n5. Place JwtAuthenticationFilter before UsernamePasswordAuthenticationFilter in the filter chain.',
    difficulty: 'Hard',
    tags: ['Security', 'JWT', 'REST API']
  }
];

