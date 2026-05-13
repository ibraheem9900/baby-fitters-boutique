import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "sonner";
import { CartProvider } from "@/lib/cart";
import { HomePage } from "@/pages/HomePage";
import { CategoryPage } from "@/pages/CategoryPage";
import { SubcategoryPage } from "@/pages/SubcategoryPage";
import { ProductPage } from "@/pages/ProductPage";
import { SearchPage } from "@/pages/SearchPage";
import { SalePage } from "@/pages/SalePage";
import { ContactPage } from "@/pages/ContactPage";
import { ShippingPage } from "@/pages/ShippingPage";
import { ReturnsPage } from "@/pages/ReturnsPage";
import { SecretPortalPage } from "@/pages/SecretPortalPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/category/:slug/:sub" component={SubcategoryPage} />
      <Route path="/category/:slug" component={CategoryPage} />
      <Route path="/product/:id" component={ProductPage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/sale" component={SalePage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/shipping" component={ShippingPage} />
      <Route path="/returns" component={ReturnsPage} />
      <Route path="/secret-portal" component={SecretPortalPage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}

function App() {
  return (
    <CartProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
      <Toaster position="top-center" richColors closeButton />
    </CartProvider>
  );
}

export default App;
