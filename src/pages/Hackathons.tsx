import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaFilter, FaTimes } from "react-icons/fa";
import { useHackathons } from "../context/HackathonContext";
import HackathonCard from "../components/HackathonCard";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";

// Available categories for filtering
const categories = [
  "All",
  "Artificial Intelligence",
  "Blockchain",
  "Web Development",
  "Mobile",
  "Data Science",
  "Cybersecurity",
  "Gaming",
  "IoT",
  "Healthcare",
  "Sustainability",
  "Education",
  "Open Innovation",
];

const Hackathons = () => {
  const { allHackathons } = useHackathons();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filteredHackathons, setFilteredHackathons] = useState(allHackathons);

  useEffect(() => {
    let result = allHackathons;

    // Filter by search term
    if (searchTerm) {
      result = result.filter(
        (hackathon) =>
          hackathon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hackathon.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== "All") {
      result = result.filter(
        (hackathon) => hackathon.category === selectedCategory
      );
    }

    setFilteredHackathons(result);
  }, [searchTerm, selectedCategory, allHackathons]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold gradient-text mb-4">
            Explore Hackathons
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Discover exciting hackathons and showcase your skills in the global
            developer community
          </p>
        </div>

        {/* Search and Filter Bar */}
        <Card className="glass-dark mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-blue-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search hackathons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-modern pl-10"
                />
              </div>

              <div className="md:w-48">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaFilter className="text-purple-400" />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="input-modern pl-10 appearance-none cursor-pointer"
                  >
                    {categories.map((category) => (
                      <option
                        key={category}
                        value={category}
                        className="bg-gray-800 text-white"
                      >
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                onClick={resetFilters}
                variant="glass"
                size="default"
                className="md:w-auto flex items-center"
              >
                <FaTimes className="mr-2 w-4 h-4" /> Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        {(searchTerm || selectedCategory !== "All") && (
          <div className="mb-8">
            <p className="text-gray-400 text-lg">
              Found{" "}
              <span className="text-blue-400 font-semibold">
                {filteredHackathons.length}
              </span>{" "}
              hackathon
              {filteredHackathons.length !== 1 ? "s" : ""}
              {searchTerm && (
                <span>
                  {" "}
                  matching{" "}
                  <span className="text-blue-400 font-semibold">
                    "{searchTerm}"
                  </span>
                </span>
              )}
              {selectedCategory !== "All" && (
                <span>
                  {" "}
                  in{" "}
                  <span className="text-purple-400 font-semibold">
                    {selectedCategory}
                  </span>
                </span>
              )}
            </p>
          </div>
        )}

        {/* Hackathons Grid */}
        {filteredHackathons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredHackathons.map((hackathon) => (
              <Link
                key={hackathon.id}
                to={`/hackathon/${hackathon.id}`}
                className="block"
              >
                <HackathonCard hackathon={hackathon} />
              </Link>
            ))}
          </div>
        ) : (
          <Card className="glass-dark text-center py-16">
            <CardContent>
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <FaSearch className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  No hackathons found
                </h3>
                <p className="text-gray-400 mb-8">
                  Try adjusting your search or filter to find what you're
                  looking for.
                </p>
                {(searchTerm || selectedCategory !== "All") && (
                  <Button onClick={resetFilters} variant="cyber">
                    Clear All Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Hackathons;
