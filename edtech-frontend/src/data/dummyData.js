// Dummy data for courses and lessons

export const courses = [
  {
    id: 1,
    title: "Introduction to React",
    description: "Learn the fundamentals of React including components, props, and state management.",
    instructor: "John Doe",
    duration: "8 hours",
    level: "Beginner",
    image: "https://via.placeholder.com/400x250?text=React+Course",
    lessons: [
      {
        id: 101,
        title: "What is React?",
        content: "React is a JavaScript library for building user interfaces. It allows you to create reusable UI components.",
        duration: "15 min",
        order: 1
      },
      {
        id: 102,
        title: "Components and Props",
        content: "Components are the building blocks of React applications. Props allow you to pass data to components.",
        duration: "20 min",
        order: 2
      },
      {
        id: 103,
        title: "State Management",
        content: "State allows components to create and manage their own data. Learn about useState hook.",
        duration: "25 min",
        order: 3
      }
    ]
  },
  {
    id: 2,
    title: "Advanced JavaScript",
    description: "Master advanced JavaScript concepts including closures, promises, and async/await.",
    instructor: "Jane Smith",
    duration: "12 hours",
    level: "Intermediate",
    image: "https://via.placeholder.com/400x250?text=JavaScript+Course",
    lessons: [
      {
        id: 201,
        title: "Closures and Scope",
        content: "Understanding closures and lexical scoping in JavaScript.",
        duration: "30 min",
        order: 1
      },
      {
        id: 202,
        title: "Promises and Async/Await",
        content: "Working with asynchronous JavaScript using promises and async/await syntax.",
        duration: "40 min",
        order: 2
      }
    ]
  },
  {
    id: 3,
    title: "DBMS",
    description: "Learn DBMS",
    instructor: "Kesari",
    duration: "14 hours",
    level: "Advanced",
    image: "https://via.placeholder.com/400x250?text=Full+Stack+Course",
    lessons: [
      {
        id: 301,
        title: "Setting Up Your Environment", 
        content: "Learn how to set up a DBMS environment.",
        duration: "20 min",
        order: 1
      },
      {
        id: 302,
        title: "DBMS Design",
        content: "Designing DBMS.",
        duration: "35 min",
        order: 2
      },
      {
        id: 303,
        title: "Database Integration",
        content: "Connecting your application to databases and managing data.",
        duration: "45 min",
        order: 3
      }
    ]
  },
  {
    id: 4,
    title: "Advanced JavaScript",
    description: "Master advanced JavaScript concepts including closures, promises, and async/await.",
    instructor: "Jane Smith",
    duration: "12 hours",
    level: "Intermediate",
    image: "https://via.placeholder.com/400x250?text=JavaScript+Course",
    lessons: [
      {
        id: 201,
        title: "Closures and Scope",
        content: "Understanding closures and lexical scoping in JavaScript.",
        duration: "30 min",
        order: 1
      },
      {
        id: 202,
        title: "Promises and Async/Await",
        content: "Working with asynchronous JavaScript using promises and async/await syntax.",
        duration: "40 min",
        order: 2
      }
    ]
  }
];

export const users = {
  student: {
    username: "student",
    password: "student123",
    role: "student"
  },
  admin: {
    username: "admin",
    password: "admin123",
    role: "admin"
  }
};




