import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useCart } from '../hooks/useCart';

// ProductCard component doesn't need motion import since we're using standard divs
const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity
    });
    
    // Reset quantity after adding to cart
    setQuantity(1);
  };
  return (
    <div 
      className="card"
    >
      <img 
        src={product.image} 
        alt={product.name} 
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-gray-600 text-sm">{product.description}</p>
        <p className="text-red-600 font-bold mt-2">₹{product.price.toFixed(2)}/{product.unit}</p>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center border rounded">
            <button 
              onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
              className="px-3 py-1 border-r hover:bg-gray-100"
            >
              -
            </button>
            <span className="px-3 py-1">{quantity}</span>
            <button 
              onClick={() => setQuantity(prev => prev + 1)}
              className="px-3 py-1 border-l hover:bg-gray-100"
            >
              +
            </button>
          </div>
            <button 
            onClick={handleAddToCart}
            className="btn-primary"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductGrid = ({ categoryId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let productsQuery;
        
        if (categoryId) {
          // If a category is selected, filter products by category
          productsQuery = query(
            collection(db, 'products'),
            where('categoryId', '==', categoryId)
          );
        } else {
          // If no category is selected, get all products
          productsQuery = collection(db, 'products');
        }
        
        const productsSnapshot = await getDocs(productsQuery);
        const productsList = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setProducts(productsList);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch products. Please try again later.');
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchProducts();
  }, [categoryId]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center text-red-600 py-8">
        {error}
      </div>
    );
  }
  
  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        No products available at the moment.
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
