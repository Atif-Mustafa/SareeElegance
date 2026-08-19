const fs = require('fs');
let content = fs.readFileSync('client/src/pages/PLP.tsx', 'utf-8');

// Replace imports
content = content.replace(
  "import { useStore } from '../store/useStore';",
  "import { useStore } from '../store/useStore';\nimport { catalogApi } from '../features/catalog/api/catalog.api';\nimport { mapSummaryToLegacyProduct } from '../features/catalog/api/catalog.mapper';\nimport { Product } from '../types';"
);

// We replace the state logic completely
const oldLogicPattern = /const \{ products\, formatPrice \} = useStore\(\);[\s\S]*?const filteredProducts = useMemo\(\(\) => \{[\s\S]*?\}\, \[.*?\]\);/;

const newLogic = `const { formatPrice } = useStore();
  const currentCategoryInfo = { title: category === 'all' ? 'All Sarees' : category, subtitle: 'Discover our exclusive heritage weaves.' };
  const [gridCols, setGridCols] = useState<2 | 4>(4);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Filter States
  const [selectedFabric, setSelectedFabric] = useState<string>('');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('');
  const [selectedZari, setSelectedZari] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number>(60000);
  const [sortBy, setSortBy] = useState<'bestseller' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('newest');

  // Available Facet Options
  const fabricsList = ['Banarasi Katan Silk', 'Kanjivaram Silk', 'Tissue Silk', 'Organza Silk'];
  const occasionsList = ['Bridal', 'Festive', 'Reception & Party'];
  const zariList = ['Real Gold/Silver Zari', 'Tested Zari', 'Antique Metallic Zari'];

  const toggleFabric = (fab: string) => setSelectedFabric(prev => prev === fab ? '' : fab);
  const toggleOccasion = (occ: string) => setSelectedOccasion(prev => prev === occ ? '' : occ);
  const toggleZari = (zari: string) => setSelectedZari(prev => prev === zari ? '' : zari);

  const resetAllFilters = () => {
    setSelectedFabric('');
    setSelectedOccasion('');
    setSelectedZari('');
    setMaxPrice(60000);
    setSortBy('newest');
  };

  React.useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setApiError(null);
      try {
        let sortApi = 'newest';
        if (sortBy === 'price-asc') sortApi = 'price_asc';
        if (sortBy === 'price-desc') sortApi = 'price_desc';

        const res = await catalogApi.getProducts({
          category: category !== 'all' ? category : undefined,
          fabric: selectedFabric || undefined,
          occasion: selectedOccasion || undefined,
          maxPriceMinor: (maxPrice * 100).toString(),
          sort: sortApi as any,
          limit: 24,
        });
        
        setFilteredProducts(res.data.map(mapSummaryToLegacyProduct));
      } catch (err: any) {
        setApiError(err.message || 'Failed to load products');
        setFilteredProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchProducts();
    }, 300); // Debounce
    return () => clearTimeout(timer);
  }, [category, sortBy, selectedFabric, selectedOccasion, selectedZari, maxPrice]);`;

content = content.replace(oldLogicPattern, newLogic);

if (!content.includes('catalogApi')) {
  console.log("FAILED to replace state logic!");
  process.exit(1);
}

// Replace selected arrays with single selected string checks
content = content.replace(/selectedFabrics\.includes/g, 'selectedFabric ===');
content = content.replace(/selectedOccasions\.includes/g, 'selectedOccasion ===');
content = content.replace(/selectedZaris\.includes/g, 'selectedZari ===');
content = content.replace(/selectedFabrics/g, 'selectedFabric');
content = content.replace(/selectedOccasions/g, 'selectedOccasion');
content = content.replace(/selectedZaris/g, 'selectedZari');

content = content.replace(/const \[silkMarkOnly, setSilkMarkOnly\] = useState<boolean>\(false\);/g, '');

// Clean up silk mark JSX
const regexSilkMark = /\{\/\* Silk Mark Only Toggle \*\/\}[\s\S]*?<\/div>/;
content = content.replace(regexSilkMark, '');

// Add error UI inside grid
const errorJSX = `
          {apiError ? (
            <div className="bg-red-50 text-red-700 rounded-2xl p-12 text-center border border-red-200 space-y-4">
              <h3 className="font-serif text-2xl font-bold">Failed to load sarees</h3>
              <p className="text-xs">{apiError}</p>
              <button
                onClick={resetAllFilters}
                className="bg-red-700 text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-red-800 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : isLoading ? (`;
content = content.replace(/\{isLoading \? \(/, errorJSX);

fs.writeFileSync('client/src/pages/PLP.tsx', content, 'utf-8');
console.log("SUCCESS!");
