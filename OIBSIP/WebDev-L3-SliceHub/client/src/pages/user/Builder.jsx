import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Check, ArrowRight, ArrowLeft, Sparkles, AlertCircle, ShoppingBag, ChevronUp, ChevronDown, Layers, Flame, Milk, Salad, Loader2 } from 'lucide-react';
import { useBuilder } from '../../context/BuilderContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const STEP_DEFINITIONS = [
  { step: 1, title: 'Crust Base', icon: Layers, subtitle: 'Pick your handcrafted dough' },
  { step: 2, title: 'Artisan Sauce', icon: Flame, subtitle: 'Choose your signature spread' },
  { step: 3, title: 'Cheese Layer', icon: Milk, subtitle: 'Select your melted blend' },
  { step: 4, title: 'Farm Toppings', icon: Salad, subtitle: 'Add fresh vegetables & herbs' },
];

const Builder = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    catalog,
    loading,
    error,
    fetchCatalog,
    currentStep,
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
  } = useBuilder();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);

  const handleProceedToSummary = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/builder' } } });
      return;
    }

    if (!selectedBase || !selectedSauce || !selectedCheese) {
      setOrderError('Please complete Base, Sauce, and Cheese steps before finishing.');
      return;
    }

    try {
      setSubmittingOrder(true);
      setOrderError(null);

      const payload = {
        baseId: selectedBase._id,
        sauceId: selectedSauce._id,
        cheeseId: selectedCheese._id,
        vegetableIds: selectedVeggies.map((v) => v._id),
      };

      const res = await api.post('/orders', payload);
      if (res.data.success) {
        navigate(`/order-summary/${res.data.data._id}`);
      }
    } catch (err) {
      setOrderError(err.response?.data?.message || 'Failed to create order. Please try again.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-accent animate-spin" />
        <p className="font-display text-lg text-primary-text">Preparing the kitchen catalog...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 glass-card rounded-modal text-center space-y-4 border border-danger/30">
        <AlertCircle className="w-12 h-12 text-danger mx-auto" />
        <h2 className="font-display text-2xl font-bold text-primary-text">Unable to Load Catalog</h2>
        <p className="text-sm text-primary-muted">{error}</p>
        <button onClick={fetchCatalog} className="btn-primary mx-auto">
          Retry Catalog Connection
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 lg:pb-12">
      
      {/* Header & Horizontal Stepper */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-primary-text">
              Custom Pizza <span className="text-accent">Architect</span>
            </h1>
            <p className="text-primary-muted text-sm mt-0.5">
              Step {currentStep} of 4: {STEP_DEFINITIONS[currentStep - 1].subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-primary-muted uppercase tracking-wider font-semibold">
              Live Total:
            </span>
            <span className="font-display text-2xl font-bold text-accent">
              Rs. {totalPrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Stepper Navigation */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 bg-surface p-2 rounded-card border border-border">
          {STEP_DEFINITIONS.map((def) => {
            const isCompleted = currentStep > def.step;
            const isCurrent = currentStep === def.step;
            const Icon = def.icon;

            return (
              <button
                key={def.step}
                onClick={() => goToStep(def.step)}
                className={`flex items-center justify-center sm:justify-start gap-2 sm:px-4 py-2.5 rounded-input text-xs sm:text-sm font-semibold transition-all ${
                  isCurrent
                    ? 'bg-accent text-white shadow-warm'
                    : isCompleted
                    ? 'bg-surface-elevated text-success hover:bg-surface-hover'
                    : 'text-primary-muted hover:text-primary-text'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                    isCurrent
                      ? 'bg-white/20 text-white'
                      : isCompleted
                      ? 'bg-success/20 text-success'
                      : 'bg-surface-elevated text-primary-muted'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : def.step}
                </div>
                <span className="hidden sm:inline truncate">{def.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {orderError && (
        <div className="mb-6 p-4 rounded-input bg-danger/10 border border-danger/30 text-danger text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{orderError}</span>
        </div>
      )}

      {/* Main Grid: Left Options + Right Sticky Rail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Options Canvas */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* STEP 1: BASES */}
          {currentStep === 1 && (
            <div>
              <div className="mb-4">
                <h2 className="font-display text-2xl font-bold text-primary-text flex items-center gap-2">
                  <Layers className="w-6 h-6 text-accent" />
                  Select Your Pizza Crust Base
                </h2>
                <p className="text-primary-muted text-xs sm:text-sm">
                  Choose 1 crust option. Handcrafted and slow-fermented for 48 hours.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {catalog.bases.map((item) => {
                  const isSelected = selectedBase?._id === item._id;
                  const isOutOfStock = !item.inStock;

                  return (
                    <div
                      key={item._id}
                      onClick={() => !isOutOfStock && setSelectedBase(item)}
                      className={`relative p-5 rounded-card border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                        isOutOfStock
                          ? 'opacity-40 bg-surface/40 border-border cursor-not-allowed'
                          : isSelected
                          ? 'bg-accent/10 border-accent shadow-warm ring-1 ring-accent'
                          : 'bg-surface border-border hover:border-accent/40 hover:bg-surface-hover'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-display text-lg font-bold text-primary-text">
                            {item.name}
                          </h3>
                          <span className="text-xs text-primary-muted">
                            {item.quantity < 10 && item.inStock ? `Only ${item.quantity} left` : 'Artisan Hand-Stretched'}
                          </span>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                            isSelected
                              ? 'bg-accent border-accent text-white'
                              : 'border-border bg-surface-elevated'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between pt-3 border-t border-border">
                        <span className="font-display text-lg font-bold text-accent">
                          Rs. {item.price.toFixed(2)}
                        </span>
                        {isOutOfStock && (
                          <span className="badge bg-danger/20 border-danger/30 text-danger text-[10px]">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: SAUCES */}
          {currentStep === 2 && (
            <div>
              <div className="mb-4">
                <h2 className="font-display text-2xl font-bold text-primary-text flex items-center gap-2">
                  <Flame className="w-6 h-6 text-accent" />
                  Select Your Artisan Sauce
                </h2>
                <p className="text-primary-muted text-xs sm:text-sm">
                  Choose 1 sauce spread crafted from fresh herbs and vine-ripened tomatoes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {catalog.sauces.map((item) => {
                  const isSelected = selectedSauce?._id === item._id;
                  const isOutOfStock = !item.inStock;

                  return (
                    <div
                      key={item._id}
                      onClick={() => !isOutOfStock && setSelectedSauce(item)}
                      className={`relative p-5 rounded-card border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                        isOutOfStock
                          ? 'opacity-40 bg-surface/40 border-border cursor-not-allowed'
                          : isSelected
                          ? 'bg-accent/10 border-accent shadow-warm ring-1 ring-accent'
                          : 'bg-surface border-border hover:border-accent/40 hover:bg-surface-hover'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-display text-lg font-bold text-primary-text">
                            {item.name}
                          </h3>
                          <span className="text-xs text-primary-muted">
                            Simmered fresh daily
                          </span>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                            isSelected
                              ? 'bg-accent border-accent text-white'
                              : 'border-border bg-surface-elevated'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between pt-3 border-t border-border">
                        <span className="font-display text-lg font-bold text-accent">
                          +Rs. {item.price.toFixed(2)}
                        </span>
                        {isOutOfStock && (
                          <span className="badge bg-danger/20 border-danger/30 text-danger text-[10px]">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: CHEESES */}
          {currentStep === 3 && (
            <div>
              <div className="mb-4">
                <h2 className="font-display text-2xl font-bold text-primary-text flex items-center gap-2">
                  <Milk className="w-6 h-6 text-accent" />
                  Select Your Cheese Blend
                </h2>
                <p className="text-primary-muted text-xs sm:text-sm">
                  Choose 1 premium cheese variety for optimal stretch and golden melt.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {catalog.cheeses.map((item) => {
                  const isSelected = selectedCheese?._id === item._id;
                  const isOutOfStock = !item.inStock;

                  return (
                    <div
                      key={item._id}
                      onClick={() => !isOutOfStock && setSelectedCheese(item)}
                      className={`relative p-5 rounded-card border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                        isOutOfStock
                          ? 'opacity-40 bg-surface/40 border-border cursor-not-allowed'
                          : isSelected
                          ? 'bg-accent/10 border-accent shadow-warm ring-1 ring-accent'
                          : 'bg-surface border-border hover:border-accent/40 hover:bg-surface-hover'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-display text-lg font-bold text-primary-text">
                            {item.name}
                          </h3>
                          <span className="text-xs text-primary-muted">
                            100% pure artisan dairy or cashew vegan
                          </span>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                            isSelected
                              ? 'bg-accent border-accent text-white'
                              : 'border-border bg-surface-elevated'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between pt-3 border-t border-border">
                        <span className="font-display text-lg font-bold text-accent">
                          +Rs. {item.price.toFixed(2)}
                        </span>
                        {isOutOfStock && (
                          <span className="badge bg-danger/20 border-danger/30 text-danger text-[10px]">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: VEGETABLES (MULTI-SELECT) */}
          {currentStep === 4 && (
            <div>
              <div className="mb-4">
                <h2 className="font-display text-2xl font-bold text-primary-text flex items-center gap-2">
                  <Salad className="w-6 h-6 text-accent" />
                  Add Fresh Farm Toppings
                </h2>
                <p className="text-primary-muted text-xs sm:text-sm">
                  Multi-select as many toppings as you like ({selectedVeggies.length} selected).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {catalog.vegetables.map((item) => {
                  const isSelected = selectedVeggies.some((v) => v._id === item._id);
                  const isOutOfStock = !item.inStock;

                  return (
                    <div
                      key={item._id}
                      onClick={() => !isOutOfStock && toggleVeggie(item)}
                      className={`relative p-5 rounded-card border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                        isOutOfStock
                          ? 'opacity-40 bg-surface/40 border-border cursor-not-allowed'
                          : isSelected
                          ? 'bg-accent/10 border-accent shadow-warm ring-1 ring-accent'
                          : 'bg-surface border-border hover:border-accent/40 hover:bg-surface-hover'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-display text-lg font-bold text-primary-text">
                            {item.name}
                          </h3>
                          <span className="text-xs text-primary-muted">
                            Fresh farm picked
                          </span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                            isSelected
                              ? 'bg-accent border-accent text-white'
                              : 'border-border bg-surface-elevated'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between pt-2 border-t border-border">
                        <span className="font-display text-base font-bold text-accent">
                          +Rs. {item.price.toFixed(2)}
                        </span>
                        {isOutOfStock && (
                          <span className="badge bg-danger/20 border-danger/30 text-danger text-[10px]">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stepper Bottom Controls */}
          <div className="pt-6 flex items-center justify-between border-t border-border">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="btn-secondary text-sm px-5 py-2.5 disabled:opacity-30"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                disabled={!isStepValid(currentStep)}
                className="btn-primary text-sm px-6 py-2.5 shadow-warm disabled:opacity-40"
              >
                <span>Continue to Step {currentStep + 1}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleProceedToSummary}
                disabled={submittingOrder || !selectedBase || !selectedSauce || !selectedCheese}
                className="btn-primary text-sm px-8 py-3 shadow-accent-glow"
              >
                {submittingOrder ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Order...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Review & Checkout (Rs. {totalPrice.toFixed(2)})</span>
                  </div>
                )}
              </button>
            )}
          </div>

        </div>

        {/* Right Sticky Order Summary Rail (Desktop) */}
        <div className="hidden lg:block lg:col-span-4 sticky top-24">
          <div className="glass-card rounded-modal p-6 shadow-warm border border-border space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-accent" />
                <h3 className="font-display font-bold text-lg text-primary-text">
                  Your Custom Pizza
                </h3>
              </div>
              <span className="badge bg-accent/15 border-accent/30 text-accent text-xs">
                Live Build
              </span>
            </div>

            {/* Customization Line Items */}
            <div className="space-y-4 text-xs">
              
              {/* Base */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-semibold text-primary-muted block uppercase tracking-wider text-[10px]">
                    1. Dough Base
                  </span>
                  <span className="text-primary-text font-medium text-sm">
                    {selectedBase ? selectedBase.name : <em className="text-primary-muted">Not selected</em>}
                  </span>
                </div>
                <span className="font-semibold text-primary-text text-sm">
                  {selectedBase ? `Rs. ${selectedBase.price.toFixed(2)}` : '—'}
                </span>
              </div>

              {/* Sauce */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-semibold text-primary-muted block uppercase tracking-wider text-[10px]">
                    2. Sauce
                  </span>
                  <span className="text-primary-text font-medium text-sm">
                    {selectedSauce ? selectedSauce.name : <em className="text-primary-muted">Not selected</em>}
                  </span>
                </div>
                <span className="font-semibold text-primary-text text-sm">
                  {selectedSauce ? `+Rs. ${selectedSauce.price.toFixed(2)}` : '—'}
                </span>
              </div>

              {/* Cheese */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-semibold text-primary-muted block uppercase tracking-wider text-[10px]">
                    3. Cheese
                  </span>
                  <span className="text-primary-text font-medium text-sm">
                    {selectedCheese ? selectedCheese.name : <em className="text-primary-muted">Not selected</em>}
                  </span>
                </div>
                <span className="font-semibold text-primary-text text-sm">
                  {selectedCheese ? `+Rs. ${selectedCheese.price.toFixed(2)}` : '—'}
                </span>
              </div>

              {/* Veggies */}
              <div className="space-y-1.5 pt-2 border-t border-border">
                <span className="font-semibold text-primary-muted block uppercase tracking-wider text-[10px]">
                  4. Toppings ({selectedVeggies.length})
                </span>
                {selectedVeggies.length > 0 ? (
                  selectedVeggies.map((v) => (
                    <div key={v._id} className="flex items-center justify-between text-xs text-primary-text/90">
                      <span>• {v.name}</span>
                      <span className="text-primary-muted">+Rs. {v.price.toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-primary-muted italic block">No extra toppings added</span>
                )}
              </div>

            </div>

            {/* Total Calculation */}
            <div className="pt-4 border-t border-border space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-primary-muted">Subtotal</span>
                <span className="font-display font-bold text-primary-text">
                  Rs. {totalPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-base pt-2 border-t border-border">
                <span className="font-display font-bold text-primary-text">Total Price</span>
                <span className="font-display text-2xl font-extrabold text-accent">
                  Rs. {totalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action Button */}
            {currentStep === 4 ? (
              <button
                onClick={handleProceedToSummary}
                disabled={submittingOrder || !selectedBase || !selectedSauce || !selectedCheese}
                className="w-full btn-primary text-sm py-3 shadow-warm"
              >
                {submittingOrder ? 'Generating Summary...' : 'Proceed to Checkout'}
              </button>
            ) : (
              <button
                onClick={nextStep}
                disabled={!isStepValid(currentStep)}
                className="w-full btn-primary text-sm py-3"
              >
                Next Step
              </button>
            )}

          </div>
        </div>

      </div>

      {/* Mobile Sticky Bottom Drawer Summary */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border p-4 shadow-warm-lg">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
                className="flex items-center gap-1 text-xs text-primary-muted font-medium"
              >
                <span>View item breakdown</span>
                {mobileDrawerOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
              <div className="font-display text-xl font-bold text-accent">
                Rs. {totalPrice.toFixed(2)}
              </div>
            </div>

            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                disabled={!isStepValid(currentStep)}
                className="btn-primary text-xs py-2.5 px-4"
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={handleProceedToSummary}
                disabled={submittingOrder || !selectedBase || !selectedSauce || !selectedCheese}
                className="btn-primary text-xs py-2.5 px-4"
              >
                Checkout
              </button>
            )}
          </div>

          {/* Expanded Mobile Drawer */}
          {mobileDrawerOpen && (
            <div className="mt-4 pt-4 border-t border-border space-y-2 text-xs max-h-48 overflow-y-auto">
              <div className="flex justify-between">
                <span className="text-primary-muted">Base:</span>
                <span>{selectedBase?.name || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-muted">Sauce:</span>
                <span>{selectedSauce?.name || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-muted">Cheese:</span>
                <span>{selectedCheese?.name || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-muted">Toppings:</span>
                <span>{selectedVeggies.map((v) => v.name).join(', ') || 'None'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Builder;
