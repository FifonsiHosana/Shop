import { useSearchParams } from 'react-router-dom';

const SortOptions = () => {

  const [searchParams, setSearchParams] = useSearchParams();

  const handleSortChange =(e)=>{
    const sortBy = e.target.value;
    searchParams.set("sortBy", sortBy);
    setSearchParams(searchParams);
  }
  return (
    <div className="mb-8 flex items-start h-5 justify-end">
      <select id="sort" value={searchParams.get("sortBy")||""} onChange={handleSortChange} className="border p-2 rounded-md focus:outline-none">
        <option value="">Default</option>
        <option value="priceAsc">Price: Low to High</option>
        <option value="PriceDesc">Price: High to low</option>
        <option value="popularity">Popularity</option>
      </select>
    </div>
  );
}

export default SortOptions;