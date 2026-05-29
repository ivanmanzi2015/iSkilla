/* ================= BASIC COURSES ================= */
export const courses = [
  {
    id: 'html',
    head_1: 'HTML',
    instructor: 'Judy Richardson',
    instructor_img: '/Images/html image.jpg',
    image: '/Images/html image.jpg',
    paragraph: {
      span: 'HTML:',
      difn: ' 🔶 HyperText Markup Language '
    },
    head_2: 'Get full course of Html',
    link: '/course/course.html',
    video: 'https://www.youtube.com/embed/kUMe1FH4CHE',
    outcomes: [
      "Build professional, SEO-optimized website structures",
      "Master advanced HTML5 forms and data validation",
      "Implement web accessibility standards (WCAG)",
      "Prepare high-quality code for real-world deployment"
    ],
    project_desc: "You will build a 'Professional Portfolio Hub.' This project requires you to create a multi-page site featuring complex data tables, semantic article layouts, and an interactive contact system, proving you are ready for a junior developer role.",
    syllabus: [
      { t: "Foundation & Semantics", d: "Moving beyond basic tags to professional document outlining." },
      { t: "Media & Integration", d: "Optimizing images and embedding third-party content correctly." },
      { t: "Forms & Logic", d: "Designing user-friendly interfaces for data collection." }
    ]
  },
  {
    id: 'css',
    head_1: 'CSS',
    instructor: 'Judy Richardson',
    instructor_img: '/Images/judy.jpg',
    image: '/Images/css program.jpg',
    paragraph: {
      span: 'CSS:',
      difn: ' 🔷 Cascading Style Sheet '
    },
    head_2: 'Get full course of CSS',
    link: '/course/course.html',
    video: 'https://www.youtube.com/embed/kUMe1FH4CHE',
    outcomes: [
      "Build professional, SEO-optimized website structures",
      "Master advanced HTML5 forms and data validation",
      "Implement web accessibility standards (WCAG)",
      "Prepare high-quality code for real-world deployment"
    ],
    project_desc: "You will build a 'Professional Portfolio Hub.' This project requires you to create a multi-page site featuring complex data tables, semantic article layouts, and an interactive contact system, proving you are ready for a junior developer role.",
    syllabus: [
      { t: "Foundation & Semantics", d: "Moving beyond basic tags to professional document outlining." },
      { t: "Media & Integration", d: "Optimizing images and embedding third-party content correctly." },
      { t: "Forms & Logic", d: "Designing user-friendly interfaces for data collection." }
    ]
  },
  {
    id: 'js',
    head_1: 'JS',
    instructor: 'Judy Richardson',
    instructor_img: '/Images/judy.jpg',
    image: '/Images/javascript-jpg.webp',
    paragraph: {
      span: 'JS:',
      difn: ' 🟨 JavaScript '
    },
    head_2: 'Get full course of JS',
    link: '/course/course.html',
    video: 'https://www.youtube.com/embed/kUMe1FH4CHE'
  }
];

/* ================= TRENDING COURSES ================= */
export const trendingCourses = [
  { id: 'python', head_1: 'Python for Beginners', instructor: 'Judy Richardson', instructor_img: '/Images/judy.jpg', skill: 'Python Programming', image: '/Images/imp-3.jpg', paragraph: { span: 'Python:', difn: ' Start as Beginner' }, head_2: 'Get Full Course', link: '/course/course.html' },
  { id: 'django', head_1: 'Django Web Dev', instructor: 'Judy Richardson', instructor_img: '/Images/judy.jpg', skill: 'Web Development', image: '/Images/imp-2.webp', paragraph: { span: 'Web:', difn: ' Build websites' }, head_2: 'Get Full Course', link: '/course/course.html' },
  { id: 'react', head_1: 'React JS', skill: 'Web Development', image: '/Images/html image.jpg', paragraph: { span: 'JS:', difn: ' Frontend' }, head_2: 'Get Course', link: '/course/course.html' },
  { id: 'node', head_1: 'Node JS', skill: 'Web Development', image: '/Images/css program.jpg', paragraph: { span: 'JS:', difn: ' Backend' }, head_2: 'Get Course', link: '/course/course.html' },
  { id: 'html5', head_1: 'HTML5', skill: 'Web Development', image: '/Images/imp-3.jpg', paragraph: { span: 'HTML:', difn: ' Structure' }, head_2: 'Get Course', link: '/course/course.html' },
  { id: 'css3', head_1: 'CSS3', skill: 'Web Development', image: '/Images/imp-2.webp', paragraph: { span: 'CSS:', difn: ' Style' }, head_2: 'Get Course', link: '/course/course.html' }
];

/* ================= JUST FOR YOU ================= */
export const JustForYou = [
  { id: 'google-data', head_1: 'Google Data Analytics', duration: '1-6 Months', image: '/Images/imp-3.jpg', paragraph: { span: 'Google:', difn: ' Professional Certificate' }, head_2: 'Professional Certificate', link: '/course/course.html' },
  { id: 'google-ai', head_1: 'Google AI Essentials', duration: '1-6 Months', image: '/Images/imp-2.webp', paragraph: { span: 'Google:', difn: ' Build toward a degree' }, head_2: 'Specialization', link: '/course/course.html' },
  { id: 'seo', head_1: 'SEO Strategy', duration: '2 hours or less', image: '/Images/imp-3.jpg', paragraph: { span: 'IBM:', difn: ' Quick Course' }, head_2: 'Specialization', link: '/course/course.html' },
  { id: 'prompt', head_1: 'Prompting Essentials', duration: '2 hours or less', image: '/Images/imp-2.webp', paragraph: { span: 'Google:', difn: ' AI Basics' }, head_2: 'Specialization', link: '/course/course.html' },
  { id: 'html-quick', head_1: 'HTML Quickstart', duration: '2 hours or less', image: '/Images/html image.jpg', paragraph: { span: 'Web:', difn: ' Fast Track' }, head_2: 'Specialization', link: '/course/course.html' },
  { id: 'css-layouts', head_1: 'CSS Layouts', duration: '2 hours or less', image: '/Images/css program.jpg', paragraph: { span: 'Web:', difn: ' UI Basics' }, head_2: 'Specialization', link: '/course/course.html' },
  { id: 'js-syntax', head_1: 'JS Syntax', duration: '2 hours or less', image: '/Images/javascript-jpg.webp', paragraph: { span: 'JS:', difn: ' 90 Mins' }, head_2: 'Specialization', link: '/course/course.html' }
];

/* ================= COURSE LESSONS ================= */
export const courseLessons = {
  html: [
    { lessonId: 1, title: "Introduction to HTML", duration: "10 min", video: "https://www.youtube.com/embed/kUMe1FH4CHE", download: "https://drive.google.com/file/d/HTML1/view" },
    { lessonId: 2, title: "HTML Elements & Tags", duration: "15 min", video: "https://www.youtube.com/embed/kUMe1FH4CHE", download: "https://drive.google.com/file/d/HTML2/view" },
    { lessonId: 3, title: "Semantic HTML", duration: "18 min", video: "https://www.youtube.com/embed/kUMe1FH4CHE", download: "https://drive.google.com/file/d/HTML3/view" },
    { lessonId: 4, title: "Forms & Inputs", duration: "20 min", video: "https://www.youtube.com/embed/kUMe1FH4CHE", download: "https://drive.google.com/file/d/HTML4/view" },
    { lessonId: 5, title: "HTML Final Project", duration: "30 min", video: "https://www.youtube.com/embed/kUMe1FH4CHE", download: "https://drive.google.com/file/d/HTML5/view" }
  ],

  css: [
    { lessonId: 1, title: "CSS Basics", duration: "12 min", video: "https://www.youtube.com/embed/OXGznpKZ_sA", download: "https://drive.google.com/file/d/CSS1/view" },
    { lessonId: 2, title: "Flexbox Layout", duration: "18 min", video: "https://www.youtube.com/embed/fYq5PXgSsbE", download: "https://drive.google.com/file/d/CSS2/view" },
    { lessonId: 3, title: "Grid System", duration: "20 min", video: "https://www.youtube.com/embed/jV8B24rSN5o", download: "https://drive.google.com/file/d/CSS3/view" },
    { lessonId: 4, title: "Responsive Design", duration: "22 min", video: "https://www.youtube.com/embed/srvUrASNj0s", download: "https://drive.google.com/file/d/CSS4/view" },
    { lessonId: 5, title: "CSS Final Project", duration: "35 min", video: "https://www.youtube.com/embed/1Rs2ND1ryYc", download: "https://drive.google.com/file/d/CSS5/view" }
  ],

  js: [
    { lessonId: 1, title: "JavaScript Introduction", duration: "15 min", video: "https://www.youtube.com/embed/W6NZfCO5SIk", download: "https://drive.google.com/file/d/JS1/view" },
    { lessonId: 2, title: "Variables & Functions", duration: "18 min", video: "https://www.youtube.com/embed/N8ap4k_1QEQ", download: "https://drive.google.com/file/d/JS2/view" },
    { lessonId: 3, title: "DOM Manipulation", duration: "20 min", video: "https://www.youtube.com/embed/0ik6X4DJKCc", download: "https://drive.google.com/file/d/JS3/view" },
    { lessonId: 4, title: "Events & Listeners", duration: "16 min", video: "https://www.youtube.com/embed/1QnYzj1qKJk", download: "https://drive.google.com/file/d/JS4/view" },
    { lessonId: 5, title: "JavaScript Final Project", duration: "40 min", video: "https://www.youtube.com/embed/PkZNo7MFNFg", download: "https://drive.google.com/file/d/JS5/view" }
  ],

  python: [
    { lessonId: 1, title: "Python Introduction", duration: "14 min", video: "https://www.youtube.com/embed/_uQrJ0TkZlc", download: "https://drive.google.com/file/d/PY1/view" },
    { lessonId: 2, title: "Variables & Data Types", duration: "18 min", video: "https://www.youtube.com/embed/kqtD5dpn9C8", download: "https://drive.google.com/file/d/PY2/view" },
    { lessonId: 3, title: "Loops", duration: "20 min", video: "https://www.youtube.com/embed/6iF8Xb7Z3wQ", download: "https://drive.google.com/file/d/PY3/view" },
    { lessonId: 4, title: "Functions", duration: "22 min", video: "https://www.youtube.com/embed/9Os0o3wzS_I", download: "https://drive.google.com/file/d/PY4/view" },
    { lessonId: 5, title: "Python Final Project", duration: "45 min", video: "https://www.youtube.com/embed/rfscVS0vtbw", download: "https://drive.google.com/file/d/PY5/view" }
  ],

  django: [
    { lessonId: 1, title: "Django Intro", duration: "15 min", video: "https://www.youtube.com/embed/F5mRW0jo-U4", download: "https://drive.google.com/file/d/DJ1/view" },
    { lessonId: 2, title: "Setup & First App", duration: "18 min", video: "https://www.youtube.com/watch?v=rHux0gMZ3Eg", download: "https://drive.google.com/file/d/DJ2/view" },
    { lessonId: 3, title: "Models & Views", duration: "20 min", video: "https://www.youtube.com/playlist?list=PLsyeobzWxl7r2ukVgTqIQcl-1T0C2mzau", download: "https://drive.google.com/file/d/DJ3/view" },
    { lessonId: 4, title: "Templates & CRUD", duration: "22 min", video: "https://www.youtube.com/playlist?list=PL0Zuz27SZ-6NamGNr7dEqzNFEcZ_FAUVX", download: "https://drive.google.com/file/d/DJ4/view" },
    { lessonId: 5, title: "Django Final Project", duration: "30 min", video: "https://www.youtube.com/embed/F5mRW0jo-U4", download: "https://drive.google.com/file/d/DJ5/view" }
  ],

  react: [
    { lessonId: 1, title: "React Introduction", duration: "15 min", video: "https://www.youtube.com/watch?v=CgkZ7MvWUAA", download: "https://drive.google.com/file/d/RE1/view" },
    { lessonId: 2, title: "Components", duration: "18 min", video: "https://www.youtube.com/watch?v=x4rFhThSX04", download: "https://drive.google.com/file/d/RE2/view" },
    { lessonId: 3, title: "State & Props", duration: "20 min", video: "https://www.youtube.com/watch?v=x4rFhThSX04", download: "https://drive.google.com/file/d/RE3/view" },
    { lessonId: 4, title: "Routing", duration: "22 min", video: "https://www.youtube.com/watch?v=CgkZ7MvWUAA", download: "https://drive.google.com/file/d/RE4/view" },
    { lessonId: 5, title: "React Project", duration: "30 min", video: "https://www.youtube.com/watch?v=CgkZ7MvWUAA", download: "https://drive.google.com/file/d/RE5/view" }
  ],

  node: [
    { lessonId: 1, title: "Node.js Intro", duration: "12 min", video: "https://www.youtube.com/watch?v=WlgGfipGS1A", download: "https://drive.google.com/file/d/NO1/view" },
    { lessonId: 2, title: "Modules & NPM", duration: "18 min", video: "https://www.youtube.com/watch?v=WlgGfipGS1A", download: "https://drive.google.com/file/d/NO2/view" },
    { lessonId: 3, title: "Express Basics", duration: "20 min", video: "https://www.youtube.com/watch?v=WlgGfipGS1A", download: "https://drive.google.com/file/d/NO3/view" },
    { lessonId: 4, title: "APIs with Node", duration: "22 min", video: "https://www.youtube.com/watch?v=WlgGfipGS1A", download: "https://drive.google.com/file/d/NO4/view" },
    { lessonId: 5, title: "Node Final Project", duration: "30 min", video: "https://www.youtube.com/watch?v=WlgGfipGS1A", download: "https://drive.google.com/file/d/NO5/view" }
  ],
  
  html5: [
    { lessonId: 1, title: "HTML5 Overview", duration: "12 min", video: "https://www.youtube.com/embed/kUMe1FH4CHE", download: "https://drive.google.com/file/d/H5_1/view" },
    { lessonId: 2, title: "Semantic Tags", duration: "18 min", video: "https://www.youtube.com/embed/kUMe1FH4CHE", download: "https://drive.google.com/file/d/H5_2/view" },
    { lessonId: 3, title: "Multimedia", duration: "20 min", video: "https://www.youtube.com/embed/kUMe1FH4CHE", download: "https://drive.google.com/file/d/H5_3/view" },
    { lessonId: 4, title: "Forms APIs", duration: "22 min", video: "https://www.youtube.com/embed/kUMe1FH4CHE", download: "https://drive.google.com/file/d/H5_4/view" },
    { lessonId: 5, title: "HTML5 Project", duration: "30 min", video: "https://www.youtube.com/embed/kUMe1FH4CHE", download: "https://drive.google.com/file/d/H5_5/view" }
  ],

  css3: [
    { lessonId: 1, title: "CSS3 Overview", duration: "12 min", video: "https://www.youtube.com/embed/OXGznpKZ_sA", download: "https://drive.google.com/file/d/C3_1/view" },
    { lessonId: 2, title: "Animations", duration: "18 min", video: "https://www.youtube.com/embed/OXGznpKZ_sA", download: "https://drive.google.com/file/d/C3_2/view" },
    { lessonId: 3, title: "Advanced Flexbox", duration: "20 min", video: "https://www.youtube.com/embed/OXGznpKZ_sA", download: "https://drive.google.com/file/d/C3_3/view" },
    { lessonId: 4, title: "Responsive Techniques", duration: "22 min", video: "https://www.youtube.com/embed/OXGznpKZ_sA", download: "https://drive.google.com/file/d/C3_4/view" },
    { lessonId: 5, title: "CSS3 Project", duration: "30 min", video: "https://www.youtube.com/embed/OXGznpKZ_sA", download: "https://drive.google.com/file/d/C3_5/view" }
  ],

  "google-data": [
    { lessonId: 1, title: "Intro to Analytics", duration: "15 min", video: "https://www.youtube.com/embed/kUMe1FH4CHE", download: "https://drive.google.com/file/d/GD1/view" },
    { lessonId: 2, title: "Data Prep", duration: "20 min", video: "https://www.youtube.com/embed/kUMe1FH4CHE", download: "https://drive.google.com/file/d/GD2/view" },
    { lessonId: 3, title: "Visualization", duration: "25 min", video: "https://www.youtube.com/embed/kUMe1FH4CHE", download: "https://drive.google.com/file/d/GD3/view" },
    { lessonId: 4, title: "Tools", duration: "30 min", video: "https://www.youtube.com/embed/kUMe1FH4CHE", download: "https://drive.google.com/file/d/GD4/view" },
    { lessonId: 5, title: "Final Project", duration: "35 min", video: "https://www.youtube.com/embed/kUMe1FH4CHE", download: "https://drive.google.com/file/d/GD5/view" }
  ],

  "google-ai": [
    { lessonId: 1, title: "Intro to AI", duration: "12 min", video: "https://www.youtube.com/embed/kUMe1FH4CHE", download: "https://drive.google.com/file/d/GA1/view" },
    { lessonId: 2, title: "ML Basics", duration: "18 min", video: "https://www.youtube.com/embed/kUMe1FH4CHE", download: "https://drive.google.com/file/d/GA2/view" },
    { lessonId: 3, title: "Neural Networks", duration: "20 min", video: "https://www.youtube.com/embed/kUMe1FH4CHE", download: "https://drive.google.com/file/d/GA3/view" },
    { lessonId: 4, title: "AI Tools", duration: "25 min", video: "https://www.youtube.com/embed/kUMe1FH4CHE", download: "https://drive.google.com/file/d/GA4/view" },
    { lessonId: 5, title: "AI Project", duration: "30 min", video: "https://www.youtube.com/embed/kUMe1FH4CHE", download: "https://drive.google.com/file/d/GA5/view" }
  ],

  seo: [
    { lessonId: 1, title: "SEO Fundamentals", duration: "10 min", video: "https://www.youtube.com/embed/kUMe1FH4CHE", download: "https://drive.google.com/file/d/S1/view" },
    { lessonId: 2, title: "Keyword Research", duration: "12 min", video: "https://www.youtube.com/embed/kUMe1FH4CHE", download: "https://drive.google.com/file/d/S2/view" },
    { lessonId: 3, title: "On-Page SEO", duration: "15 min", video: "https://www.youtube.com/embed/kUMe1FH4CHE", download: "https://drive.google.com/file/d/S3/view" },
    { lessonId: 4, title: "Link Building", duration: "20 min", video: "https://www.youtube.com/embed/kUMe1FH4CHE", download: "https://drive.google.com/file/d/S4/view" },
    { lessonId: 5, title: "SEO Case Project", duration: "25 min", video: "https://www.youtube.com/embed/kUMe1FH4CHE", download: "https://drive.google.com/file/d/S5/view" }
  ],

  prompt: [
    { lessonId: 1, title: "Intro to Prompting", duration: "10 min", video: "https://www.youtube.com/embed/kUMe1FH4CHE", download: "https://drive.google.com/file/d/P1/view" },
    { lessonId: 2, title: "Prompt Design", duration: "12 min", video: "https://www.youtube.com/embed/kUMe1FH4CHE", download: "https://drive.google.com/file/d/P2/view" },
    { lessonId: 3, title: "Testing Prompts", duration: "15 min", video: "https://www.youtube.com/embed/kUMe1FH4CHE", download: "https://drive.google.com/file/d/P3/view" },
    { lessonId: 4, title: "Advanced Prompting", duration: "18 min", video: "https://www.youtube.com/embed/kUMe1FH4CHE", download: "https://drive.google.com/file/d/P4/view" },
    { lessonId: 5, title: "Prompting Project", duration: "20 min", video: "https://www.youtube.com/embed/kUMe1FH4CHE", download: "https://drive.google.com/file/d/P5/view" }
  ],

  "html-quick": [
    { lessonId: 1, title: "HTML Basics Quick", duration: "8 min", video: "https://www.youtube.com/embed/kUMe1FH4CHE", download: "https://drive.google.com/file/d/HQ1/view" },
    { lessonId: 2, title: "Tags Quick", duration: "10 min", video: "https://www.youtube.com/embed/kUMe1FH4CHE", download: "https://drive.google.com/file/d/HQ2/view" },
    { lessonId: 3, title: "Forms Quick", duration: "12 min", video: "https://www.youtube.com/embed/kUMe1FH4CHE", download: "https://drive.google.com/file/d/HQ3/view" },
    { lessonId: 4, title: "Semantic Quick", duration: "15 min", video: "https://www.youtube.com/embed/kUMe1FH4CHE", download: "https://drive.google.com/file/d/HQ4/view" },
    { lessonId: 5, title: "Mini Project", duration: "20 min", video: "https://www.youtube.com/embed/kUMe1FH4CHE", download: "https://drive.google.com/file/d/HQ5/view" }
  ],

  "css-layouts": [
    { lessonId: 1, title: "CSS Basics Quick", duration: "8 min", video: "https://www.youtube.com/embed/OXGznpKZ_sA", download: "https://drive.google.com/file/d/CL1/view" },
    { lessonId: 2, title: "Flexbox Quick", duration: "10 min", video: "https://www.youtube.com/embed/OXGznpKZ_sA", download: "https://drive.google.com/file/d/CL2/view" },
    { lessonId: 3, title: "Grid Quick", duration: "12 min", video: "https://www.youtube.com/embed/OXGznpKZ_sA", download: "https://drive.google.com/file/d/CL3/view" },
    { lessonId: 4, title: "Responsive Layouts", duration: "15 min", video: "https://www.youtube.com/embed/OXGznpKZ_sA", download: "https://drive.google.com/file/d/CL4/view" },
    { lessonId: 5, title: "Mini CSS Project", duration: "20 min", video: "https://www.youtube.com/embed/OXGznpKZ_sA", download: "https://drive.google.com/file/d/CL5/view" }
  ],

  "js-syntax": [
    { lessonId: 1, title: "JS Basics Quick", duration: "8 min", video: "https://www.youtube.com/embed/W6NZfCO5SIk", download: "https://drive.google.com/file/d/JSQ1/view" },
    { lessonId: 2, title: "Variables Quick", duration: "10 min", video: "https://www.youtube.com/embed/W6NZfCO5SIk", download: "https://drive.google.com/file/d/JSQ2/view" },
    { lessonId: 3, title: "DOM Quick", duration: "12 min", video: "https://www.youtube.com/embed/W6NZfCO5SIk", download: "https://drive.google.com/file/d/JSQ3/view" },
    { lessonId: 4, title: "Events Quick", duration: "15 min", video: "https://www.youtube.com/embed/W6NZfCO5SIk", download: "https://drive.google.com/file/d/JSQ4/view" },
    { lessonId: 5, title: "Mini JS Project", duration: "20 min", video: "https://www.youtube.com/embed/W6NZfCO5SIk", download: "https://drive.google.com/file/d/JSQ5/view" }
  ]
};