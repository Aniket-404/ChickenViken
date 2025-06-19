const LoadingSpinner = ({ size = 'medium', className = '' }) => {
  const sizes = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`skeleton rounded-full ${sizes[size]}`}></div>
    </div>
  );
};

export default LoadingSpinner;
