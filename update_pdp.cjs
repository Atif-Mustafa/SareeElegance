const fs = require('fs');
let content = fs.readFileSync('client/src/pages/PDP.tsx', 'utf-8');

// Imports
content = content.replace(
  "import { useStore } from '../store/useStore';",
  "import { useStore } from '../store/useStore';\nimport { catalogApi } from '../features/catalog/api/catalog.api';\nimport { mapDetailToLegacyProduct } from '../features/catalog/api/catalog.mapper';\nimport { Product } from '../types';"
);

// We replace the state logic completely
const oldLogicPattern = /const \{ products\, formatPrice\, addToCart\, toggleWishlist\, isInWishlist\, setIsVideoModalOpen \} = useStore\(\);[\s\S]*?const \[isRelatedLoading\, setIsRelatedLoading\] = useState\(false\);[\s\S]*?\}, \[slug\]\);/;

const newLogic = `const { formatPrice, addToCart, toggleWishlist, isInWishlist, setIsVideoModalOpen } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<ColorOption>({ name: 'Standard', hex: '#6B1D2F' });
  const [isRelatedLoading, setIsRelatedLoading] = useState(false);

  React.useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      setIsLoading(true);
      setApiError(null);
      try {
        const res = await catalogApi.getProductBySlug(slug);
        const mapped = mapDetailToLegacyProduct(res);
        setProduct(mapped);
        if (mapped.colors && mapped.colors.length > 0) {
          setSelectedColor(mapped.colors[0]);
        }
      } catch (err: any) {
        if (err.status === 404) {
          setApiError('Product not found');
        } else {
          setApiError(err.message || 'Failed to load product');
        }
      } finally {
        setIsLoading(false);
        setIsRelatedLoading(true);
        setTimeout(() => setIsRelatedLoading(false), 350);
      }
    };
    fetchProduct();
  }, [slug]);`;

content = content.replace(oldLogicPattern, newLogic);

// Wrap the main return in a check for loading and error
// Wait, the easiest way is to find `if (!product) return null;` or similar, but it didn't have one because it defaulted to products[0].
const replaceReturn = `  // Calculate Extra Customization Cost`;
const newReturn = `  if (isLoading) {
    return (
      <div className="pt-32 pb-16 min-h-screen bg-[#FDFBF7] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C28E46]"></div>
      </div>
    );
  }
  
  if (apiError || !product) {
    return (
      <div className="pt-32 pb-16 min-h-screen bg-[#FDFBF7] flex justify-center items-center">
        <div className="bg-white rounded-2xl p-12 text-center border border-red-200 space-y-4 max-w-md mx-auto">
          <h3 className="font-serif text-2xl font-bold text-red-700">{apiError || 'Product Not Found'}</h3>
          <button
            onClick={() => navigate('/collections/all')}
            className="bg-[#2C221E] text-[#D4AF37] text-xs font-bold px-6 py-3 rounded-xl"
          >
            Back to Collections
          </button>
        </div>
      </div>
    );
  }

  // Calculate Extra Customization Cost`;

content = content.replace(replaceReturn, newReturn);

fs.writeFileSync('client/src/pages/PDP.tsx', content, 'utf-8');
