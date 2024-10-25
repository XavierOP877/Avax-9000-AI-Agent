interface InputProps {
    type?: string;
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }
  
  export const Input = ({ 
    type = "text", 
    placeholder, 
    value, 
    onChange 
  }: InputProps) => {
    return (
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    );
  };