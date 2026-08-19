const fs = require('fs');
let content = fs.readFileSync('client/src/pages/PLP.tsx', 'utf-8');

// Imports
content = content.replace(
  "import { useStore } from '../store/useStore';",
  "import { useStore } from '../store/useStore';\nimport { catalogApi } from '../features/catalog/api/catalog.api';\nimport { mapSummaryToLegacyProduct } from '../features/catalog/api/catalog.mapper';\nimport { Product } from '../types';"
);

// We replace the whole state logic
content = content.replace(
  /const { products, formatPrice } = useStore\(\);[\s\S]*?const filteredProducts = useMemo\(\(\) => \{[\s\S]*?\}\, \[.*?\]\);/g,
  `const { formatPrice } = useStore();
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
  const fabricsList: string[] = ['Banarasi Katan Silk', 'Kanjivaram Silk', 'Tissue Silk', 'Organza Silk'];
  const occasionsList: string[] = ['Bridal', 'Festive', 'Reception & Party'];
  const zariList: string[] = ['Real Gold/Silver Zari', 'Tested Zari', 'Antique Metallic Zari'];

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
        // fallback 'bestseller' and 'rating' are not in API schema, default to newest

        const res = await catalogApi.getProducts({
          category: category !== 'all' ? category : undefined,
          fabric: selectedFabric || undefined,
          occasion: selectedOccasion || undefined,
          // 'zari' isn't supported directly by the CatalogQuerySchema (only weave, region, color, occasion, fabric, category).
          // Wait, 'zari' isn't in Zod schema! I will omit it in API call.
          maxPriceMinor: (maxPrice * 100).toString(),
          sort: sortApi as any,
          limit: 24,
        });
        
        setFilteredProducts(res.data.map(mapSummaryToLegacyProduct));
      } catch (err: any) {
        setApiError(err.message || 'Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchProducts();
    }, 300); // Debounce
    return () => clearTimeout(timer);
  }, [category, sortBy, selectedFabric, selectedOccasion, selectedZari, maxPrice]);`
);

// We must also fix the render part where it does `selectedFabrics.includes`
content = content.replace(/selectedFabrics\.includes/g, 'selectedFabric ===');
content = content.replace(/selectedOccasions\.includes/g, 'selectedOccasion ===');
content = content.replace(/selectedZaris\.includes/g, 'selectedZari ===');

// Remove silk mark filter
content = content.replace(/\{\/\* Silk Mark Only Toggle \*\/\}[\s\S]*?<\/div>/, '');
content = content.replace(/const \[silkMarkOnly, setSilkMarkOnly\] = useState<boolean>\(false\);/g, '');

fs.writeFileSync('client/src/pages/PLP.tsx', content, 'utf-8');
