// src/components/core/ui/Alert.tsx
interface AlertProps {
    variant: 'success' | 'error' | 'warning';
    message: string;
  }
  
  export const Alert = ({ variant, message }: AlertProps) => {
    const variantClasses = {
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800'
    };
  
    return (
      <div className={`p-3 rounded-md ${variantClasses[variant]}`}>
        {message}
      </div>
    );
  };