
const ToDoItem = ({ todo, onDelete, onToggle }) => {
  return (
    <div className="flex justify-between items-center p-2 bg-white shadow mb-2 rounded">
      <div
        className={`cursor-pointer ${todo.completed ? 'line-through' : ''}`}
        onClick={() => onToggle(todo.id)}
      >
        {todo.text}
      </div>
      <button
        onClick={() => onDelete(todo.id)}
        className="bg-red-500 text-white p-1 rounded"
      >
        Delete
      </button>
    </div>
  );
};

export default ToDoItem;
