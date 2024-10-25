interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: 'primary' | 'danger';
  }
  
  export const Button = ({ 
    children, 
    onClick, 
    disabled, 
    variant = 'primary' 
  }: ButtonProps) => {
    const baseStyles = "px-4 py-2 rounded font-semibold transition-colors";
    const variantStyles = {
      primary: "bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300",
      danger: "bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300"
    };
  
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${baseStyles} ${variantStyles[variant]}`}
      >
        {children}
      </button>
    );
  };