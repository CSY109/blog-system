import { type FormEvent, useState } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar = ({ value, onChange, placeholder = 'Search...' }: SearchBarProps) => {
  const [input, setInput] = useState(value);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onChange(input);
  };

  const handleClear = () => {
    setInput('');
    onChange('');
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        className="search-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
      />
      {input && (
        <button type="button" className="search-clear" onClick={handleClear}>
          &times;
        </button>
      )}
      <button type="submit" className="btn btn-primary">
        Search
      </button>
    </form>
  );
};

export default SearchBar;
