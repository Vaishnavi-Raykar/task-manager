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
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 border rounded-md shadow-md w-1/2 h-auto">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-500">Title</label>
        <input
          type="text"
          {...register("title")}
          className="mt-1 block w-full border rounded-md p-2"
        />
        {errors.title && <p className="text-red-500">{errors.title.message}</p>}
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-500">Description</label>
        <textarea
          {...register("description")}
          className="mt-1 block w-full border rounded-md p-2"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-500">Deadline</label>
        <input
          type="datetime-local"  
          {...register("deadline")}
          className="mt-1 block w-full border rounded-md p-2"
        />
        {errors.deadline && <p className="text-red-500">{errors.deadline.message}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-500">Priority</label>
        <select {...register("priority")} className="mt-1 block w-full border rounded-md p-2">
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>
      <button type="submit" className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md">
        Add Todo
      </button>
    </form>
  );
}