"use client";
import { useState, useEffect } from "react";
import TodoForm from "@/components/TodoForm";
import { FaCheck, FaTrash } from "react-icons/fa";
import { CopilotPopup } from "@copilotkit/react-ui";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const now = new Date();
  now.setHours(now.getHours() + 8);
  
  const formattedNow = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const temp = {
    id: uuidv4(),
    title: "Read Newspaper",
    description: "Write keypoints related to economics.",
    deadline: formattedNow,
    priority: "high",
    color: "red",
    completed: false
  };
  const [todos, setTodos] = useState([temp]);

  // Create a safe version of todos for Copilot
  const safeTodos = todos.map(todo => ({
    id: todo.id,
    title: todo.title,
    description: todo.description,
    deadline: todo.deadline,
    priority: todo.priority,
    completed: todo.completed
  }));

  useCopilotReadable({
    description: "The current list of todos",
    value: JSON.stringify(safeTodos)
  });

  // Add Todo Action
  useCopilotAction({
    name: "addtodo",
    description: "Add a new todo task",
    parameters: [
      {
        name: "taskname",
        type: "string",
        description: "The name of the task to add",
        required: true,
      },
      {
        name: "taskinfo",
        type: "string",
        description: "The information about the task to add",
        required: true,
      },
      {
        name: "taskdate",
        type: "string",
        description: "The date of the task to add (YYYY-MM-DD format)",
        required: true,
      },
      {
        name: "tasktime",
        type: "string",
        description: "The time of the task to add (HH:MM format)",
        required: true,
      },
      {
        name: "taskpriority",
        type: "string",
        description: "The priority of the task to add (low, medium, high)",
        enum: ["low", "medium", "high"],
        required: true,
      }
    ],
    handler: ({ taskname, taskinfo, taskdate, tasktime, taskpriority }) => {
      const taskDeadline = `${taskdate} ${tasktime}`;
      const taskColor = getPriorityColor(taskpriority);
      const newTodo = {
        id: uuidv4(),
        title: taskname,
        description: taskinfo,
        deadline: taskDeadline,
        priority: taskpriority,
        color: taskColor,
        completed: false
      };
      addTodo(newTodo);
      return `Successfully added task: ${taskname}`;
    },
  });

  // Delete Todo Action
  useCopilotAction({
    name: "deletetodo",
    description: "Delete a specific todo task by title",
    parameters: [
      {
        name: "taskname",
        type: "string",
        description: "The name of the task to delete",
        required: true,
      }
    ],
    handler: ({ taskname }) => {
      const todoToDelete = todos.find(todo => 
        todo.title.toLowerCase() === taskname.toLowerCase()
      );
      if (todoToDelete) {
        deleteTodo(todoToDelete.id);
        return `Successfully deleted task: ${taskname}`;
      }
      return `Task not found: ${taskname}`;
    },
  });

  // Update Todo Action
  useCopilotAction({
    name: "updatetodo",
    description: "Update an existing todo task",
    parameters: [
      {
        name: "currenttaskname",
        type: "string",
        description: "The current name of the task to update",
        required: true,
      },
      {
        name: "newtaskname",
        type: "string",
        description: "The new name for the task",
        required: false,
      },
      {
        name: "newtaskinfo",
        type: "string",
        description: "The new description for the task",
        required: false,
      },
      {
        name: "newtaskdate",
        type: "string",
        description: "The new date for the task (YYYY-MM-DD format)",
        required: false,
      },
      {
        name: "newtasktime",
        type: "string",
        description: "The new time for the task (HH:MM format)",
        required: false,
      },
      {
        name: "newtaskpriority",
        type: "string",
        description: "The new priority for the task (low, medium, high)",
        enum: ["low", "medium", "high"],
        required: false,
      }
    ],
    handler: ({ currenttaskname, newtaskname, newtaskinfo, newtaskdate, newtasktime, newtaskpriority }) => {
      const todoToUpdate = todos.find(todo => 
        todo.title.toLowerCase() === currenttaskname.toLowerCase()
      );
      
      if (todoToUpdate) {
        const updatedTodo = {
          ...todoToUpdate,
          title: newtaskname || todoToUpdate.title,
          description: newtaskinfo || todoToUpdate.description,
          deadline: (newtaskdate && newtasktime) 
            ? `${newtaskdate} ${newtasktime}` 
            : todoToUpdate.deadline,
          priority: newtaskpriority || todoToUpdate.priority,
          color: newtaskpriority ? getPriorityColor(newtaskpriority) : todoToUpdate.color
        };
        
        updateTodo(todoToUpdate.id, updatedTodo);
        return `Successfully updated task: ${currenttaskname}`;
      }
      return `Task not found: ${currenttaskname}`;
    },
  });

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const addTodo = (newTodo) => {
    const updatedTodos = [...todos, newTodo];
    sortTodos(updatedTodos);
  };

  const deleteTodo = (id) => {
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    setTodos(updatedTodos);
  };

  const updateTodo = (id, updatedTodoData) => {
    const updatedTodos = todos.map((todo) => {
      if (todo.id === id) {
        return { ...todo, ...updatedTodoData };
      }
      return todo;
    });
    sortTodos(updatedTodos);
  };

  const completeTodo = (id) => {
    const updatedTodos = todos.map((todo) => {
      if (todo.id === id) {
        return { ...todo, completed: !todo.completed };
      }
      return todo;
    });
    sortTodos(updatedTodos);
  };

  const sortTodos = (updatedTodos) => {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    updatedTodos.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (priorityOrder[a.priority.toLowerCase()] === priorityOrder[b.priority.toLowerCase()]) {
        return new Date(a.deadline) - new Date(b.deadline);
      }
      return priorityOrder[a.priority.toLowerCase()] - priorityOrder[b.priority.toLowerCase()];
    });
    setTodos(updatedTodos);
  };

  return (
    <div className="container mx-auto p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 shadow-2xl" style={{ perspective: '1000px' }}>
      <h1 className="text-5xl font-bold mb-12 text-center text-slate-100 drop-shadow-md tracking-wide transform transition-transform duration-500 hover:rotate-x-6 hover:rotate-y-3">
        Task Manager
      </h1>

      <div className="flex justify-center mb-12">
        <TodoForm addTodo={addTodo} className="transition-transform duration-500 hover:scale-105" />
      </div>

      <div className="mb-12">
        <h2 className="text-4xl font-semibold text-slate-300 mb-6 border-b border-slate-500 pb-2">
          Tasks
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {todos.map((todo) => (
            <div key={todo.id} className="todo-card-wrapper">
              <TodoCard
                todo={todo}
                completeTodo={completeTodo}
                deleteTodo={deleteTodo}
              />
            </div>
          ))}
        </div>
      </div>

      <CopilotPopup
        instructions={`
          I can help you manage your tasks. You can:
          1. Add a new task
          2. Delete a task by name
          3. Update task details
          4. Mark tasks as complete
          
          Just tell me what you'd like to do!
        `}
        labels={{
          title: "Priority-Based TODO LIST",
          initial: "What would you like to do with your tasks?",
        }}
      />
    </div>
  );
}

function TodoCard({ todo, completeTodo, deleteTodo }) {
  return (
    <div
      className={`relative p-6 rounded-xl shadow-2xl transition-transform transform hover:scale-105 ${todo.color} flex flex-col justify-between`}
      style={{
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.7)',
        background: 'linear-gradient(145deg, #2d2d2d, #3e3e3e)',
      }}
    >
      <div>
        <h3 className={`text-2xl font-bold ${todo.completed ? "line-through text-gray-400" : "text-white"}`}>
          {todo.title}
        </h3>
        <p className={`font-medium ${todo.completed ? "line-through text-gray-400" : "text-gray-300"}`}>
          {todo.description}
        </p>
        <p className={`font-semibold ${todo.completed ? "line-through text-gray-400" : "text-gray-400"}`}>
          <strong>Deadline:</strong> {todo.deadline}
        </p>
        <p className={`font-semibold ${todo.completed ? "line-through text-gray-400" : "text-gray-400"}`}>
          <strong>Priority:</strong> {todo.priority}
        </p>
      </div>
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => completeTodo(todo.id)}
          className={`px-3 py-2 rounded-md text-white ${todo.completed ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"} shadow-md transition-transform transform hover:scale-110`}
        >
          <FaCheck />
        </button>
        <button
          onClick={() => deleteTodo(todo.id)}
          className="px-3 py-2 bg-red-600 text-white rounded-md shadow-md hover:bg-red-700 transition-transform transform hover:scale-110"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
}