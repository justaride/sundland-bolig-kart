import PropertyMap from "./components/Map/PropertyMap";
import properties from "./data/properties.json";
import type { Property } from "./types/property";
import { CATEGORY_COLORS } from "./constants/designSystem";

const typedProperties = properties as Property[];

const categories = Object.entries(CATEGORY_COLORS) as [string, string][];

export default function App() {
  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200 shrink-0">
        <h1 className="text-lg font-semibold text-gray-900">Sundland Bolig</h1>
        <div className="flex gap-3">
          {categories.map(([name, color]) => (
            <div
              key={name}
              className="flex items-center gap-1.5 text-xs text-gray-600"
            >
              <span
                className="w-3 h-3 rounded-full inline-block"
                style={{ background: color }}
              />
              {name}
            </div>
          ))}
        </div>
      </header>
      <main className="flex-1">
        <PropertyMap properties={typedProperties} />
      </main>
    </div>
  );
}
