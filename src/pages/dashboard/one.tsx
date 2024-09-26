import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/config-global';
import ListItem from 'src/sections/Product/ListItem';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CircularProgress, Alert, Snackbar } from '@mui/material';
import { STORAGE_KEY } from '../../auth/context/jwt/constant';

const metadata = { title: `Product List | Dashboard - ${CONFIG.appName}` };

type Product = {
  id: string;
  nama_item: string;
  qty_item: number;
  kategori_item: string;
  harga_item: number;
  satuan_item: string;
};

const API_URL = `${CONFIG.serverUrl}/api/product/items`;

export default function Page() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ message: string; severity: 'success' | 'error' | undefined } | null>(null);

  const fetchProducts = async () => {
    const accessToken = sessionStorage.getItem(STORAGE_KEY);
    try {
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setProducts(response.data.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Failed to fetch products.');
    } finally {
      setLoading(false);
    }
  };

  const onEdit = async (product: Product) => {
    setAlert({ message: 'Successfully edited product!', severity: 'success' });
    setProducts([]);
    await fetchProducts();
  };

  const onAdd = async (product: Product) => {
    setAlert({ message: 'Successfully added product!', severity: 'success' });
    setProducts([]);
    await fetchProducts();
  };

  const onDelete = async (product: Product) => {
    setAlert({ message: 'Successfully deleted product!', severity: 'success' });
    setProducts([]);
    await fetchProducts();
  };

  const handleAlertClose = () => {
    setAlert(null);
  };

  useEffect(() => {    
    fetchProducts();
  }, []);

  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <p>{error}</p>
      ) : (
        <>
        <ListItem 
          title={metadata.title} 
          products={products} 
          onEdit={onEdit} 
          onDelete={onDelete} 
          onAdd={onAdd} 
        />
        <Snackbar 
            open={!!alert} 
            autoHideDuration={6000} 
            onClose={handleAlertClose}
          >
            {alert ? (
              <Alert onClose={handleAlertClose} severity={alert.severity}>
                {alert.message}
              </Alert>
            ) : undefined}
          </Snackbar>
          </>
      )}
    </>
  );
}
