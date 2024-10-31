'use client';  
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const todoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  deadline: z.string().min(1, "Deadline is required"),
  priority: z.enum(["Low", "Medium", "High"]),
});

export default function TodoForm({ addTodo }) {
  const {
    register,
    handleSubmit,
    reset, 
    formState: { errors },
  } = useForm({
    resolver: zodResolver(todoSchema),
  });

  const onSubmit = (data) => {
    addTodo(data);
    reset(); 
  };

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)} 
      className="p-6 border border-gray-700 bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl shadow-lg w-full sm:w-2/3 md:w-1/2 lg:w-1/3 text-white transform transition-all duration-300 hover:scale-105"
      style={{
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.5)',
        perspective: '1000px',
      }}
    >
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-300">Add New Task</h2>
      
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-400">Title</label>
        <input
          type="text"
          {...register("title")}
          className="mt-1 block w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-600"
        />
        {errors.title && <p className="text-red-500 mt-1 text-xs">{errors.title.message}</p>}
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-400">Description</label>
        <textarea
          {...register("description")}
          className="mt-1 block w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-600"
        />
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-400">Deadline</label>
        <input
          type="datetime-local"  
          {...register("deadline")}
          className="mt-1 block w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-600"
        />
        {errors.deadline && <p className="text-red-500 mt-1 text-xs">{errors.deadline.message}</p>}
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-400">Priority</label>
        <select 
          {...register("priority")} 
          className="mt-1 block w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-600"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      <button 
        type="submit" 
        className="w-full mt-4 py-3 bg-blue-600 text-white rounded-md font-bold shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
        style={{
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.4)',
        }}
      >
        Add Task
      </button>
    </form>
  );
}
