import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const BuilderContext = createContext(null);

export const BuilderProvider = ({ children }) => {
  const [catalog, setCatalog] = useState({
    bases: [],
    sauces: [],
    cheeses: [],
    vegetables: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentStep, setCurrentStep] = useState(1); // 1: Base, 2: Sauce, 3: Cheese, 4: Veggies
  const [selectedBase, setSelectedBase] = useState(null);
  const [selectedSauce, setSelectedSauce] = useState(null);
  const [selectedCheese, setSelectedCheese] = useState(null);
  const [selectedVeggies, setSelectedVeggies] = useState([]);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/catalog');
      if (res.data.success) {
        setCatalog(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load catalog', err);
      setError('Unable to load ingredients catalog. Please check server connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  // Compute total running price
  const totalPrice = Number((
    (selectedBase ? selectedBase.price : 0) +
    (selectedSauce ? selectedSauce.price : 0) +
    (selectedCheese ? selectedCheese.price : 0) +
    selectedVeggies.reduce((sum, v) => sum + v.price, 0)
  ).toFixed(2));

  const toggleVeggie = (veggie) => {
    setSelectedVeggies((prev) => {
      const exists = prev.some((v) => v._id === veggie._id);
      if (exists) {
        return prev.filter((v) => v._id !== veggie._id);
      } else {
        return [...prev, veggie];
      }
    });
  };

  const isStepValid = (step) => {
    switch (step) {
      case 1:
        return Boolean(selectedBase);
      case 2:
        return Boolean(selectedSauce);
      case 3:
        return Boolean(selectedCheese);
      case 4:
        return true; // Veggies are optional multi-select
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (isStepValid(currentStep) && currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const goToStep = (step) => {
    if (step >= 1 && step <= 4) {
      setCurrentStep(step);
    }
  };

  const resetBuilder = () => {
    setSelectedBase(null);
    setSelectedSauce(null);
    setSelectedCheese(null);
    setSelectedVeggies([]);
    setCurrentStep(1);
  };

  return (
    <BuilderContext.Provider
      value={{
        catalog,
        loading,
        error,
        fetchCatalog,
        currentStep,
        setCurrentStep,
        selectedBase,
        setSelectedBase,
        selectedSauce,
        setSelectedSauce,
        selectedCheese,
        setSelectedCheese,
        selectedVeggies,
        toggleVeggie,
        totalPrice,
        isStepValid,
        nextStep,
        prevStep,
        goToStep,
        resetBuilder,
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
};

export const useBuilder = () => {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error('useBuilder must be used within a BuilderProvider');
  }
  return context;
};
