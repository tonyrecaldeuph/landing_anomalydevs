import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '../../styles/tokens.css';
import './product.css';
import { ProductPage } from './ProductPage';
import { telegramProSendPage } from '../../content/products/telegramProSend';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProductPage content={telegramProSendPage} />
  </StrictMode>,
);
