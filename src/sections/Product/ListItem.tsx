import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Grid,
} from '@mui/material';
import axios from 'axios';
import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';
import { varAlpha } from 'src/theme/styles';
import { STORAGE_KEY } from '../../auth/context/jwt/constant';

// Define the product type
type Product = {
  id: string;
  nama_item: string;
  qty_item: number;
  kategori_item: string;
  harga_item: number;
  satuan_item: string;
};

interface ProductTableProps {
  title?: string;
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onAdd: (product: Product) => void;
}

// Functional component for product form
const ProductForm: React.FC<{
  newProduct: Partial<Product>,
  onChange: (field: keyof Product, value: string | number) => void,
  onSubmit: () => void
}> = ({ newProduct, onChange, onSubmit }) => (
  <Box sx={{ mb: 2 }}>
    <Grid container spacing={1}>
      {(Object.keys(newProduct) as (keyof Product)[]).map((key) => (
        <Grid item xs={2} key={key}>
          <TextField
            label={key.replace('_', ' ').toUpperCase()}
            value={newProduct[key] || ''}
            onChange={(e) => onChange(key, e.target.value)} // key is now treated as keyof Product
            size="small"
            type={typeof newProduct[key] === 'number' ? 'number' : 'text'}
          />
        </Grid>
      ))}
      <Grid item xs={2}>
        <Button variant="contained" color="success" onClick={onSubmit}>
          Add
        </Button>
      </Grid>
    </Grid>
  </Box>
);

const ProductTable: React.FC<ProductTableProps> = ({ title, products, onEdit, onDelete, onAdd }) => {
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editedFields, setEditedFields] = useState<Partial<Product>>({});
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    nama_item: '',
    kategori_item: '',
    harga_item: 0,
    qty_item: 0,
    satuan_item: '',
  });

  const handleChange = (field: keyof Product, value: string | number) => {
    setEditedFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleNewProductChange = (field: keyof Product, value: string | number) => {
    setNewProduct((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (product: Product) => {
    const updatedProduct = { ...product, ...editedFields };
    const accessToken = sessionStorage.getItem(STORAGE_KEY);
    try {
      await axios.put(`${CONFIG.serverUrl}/api/product/items/${product.id}`, updatedProduct, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setEditingRowIndex(null);
      onEdit(updatedProduct);
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  const handleAddProduct = async () => {
    const accessToken = sessionStorage.getItem(STORAGE_KEY);
    try {
      const response = await axios.post(`${CONFIG.serverUrl}/api/product/items`, newProduct, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setNewProduct({ nama_item: '', kategori_item: '', harga_item: 0, qty_item: 0, satuan_item: '' });
      setIsAdding(false);
      onAdd(response.data);
    } catch (error) {
      console.error('Failed to add product:', error);
    }
  };

  const handleDelete = async (product: Product) => {
    const accessToken = sessionStorage.getItem(STORAGE_KEY);
    try {
      await axios.delete(`${CONFIG.serverUrl}/api/product/items/${product.id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      onDelete(product);
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4">{title}</Typography>
      <Box
        sx={{
          mt: 5,
          width: 1,
          height: 'auto',
          borderRadius: 2,
          bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
          border: (theme) => `dashed 1px ${theme.vars.palette.divider}`,
          p: 2,
        }}
      >
        <Button variant="contained" color="primary" size='small' onClick={() => setIsAdding(!isAdding)} sx={{ mb: 2 }}>
          {isAdding ? 'Cancel' : 'Add Product'}
        </Button>

        {isAdding && (
          <ProductForm
            newProduct={newProduct}
            onChange={handleNewProductChange}
            onSubmit={handleAddProduct}
          />
        )}

        <TableContainer component={Paper}>
          <Table aria-label="product table">
            <TableHead>
              <TableRow>
                <TableCell>No</TableCell>
                <TableCell>Nama Item</TableCell>
                <TableCell>Kategori</TableCell>
                <TableCell>Harga</TableCell>
                <TableCell>Qty</TableCell>
                <TableCell>Satuan</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product, index) => (
                <TableRow key={product.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    {editingRowIndex === index ? (
                      <TextField
                        size="small"
                        value={editedFields.nama_item ?? product.nama_item}
                        onChange={(e) => handleChange('nama_item', e.target.value)}
                      />
                    ) : (
                      product.nama_item
                    )}
                  </TableCell>
                  <TableCell>
                    {editingRowIndex === index ? (
                      <TextField
                        size="small"
                        value={editedFields.kategori_item ?? product.kategori_item}
                        onChange={(e) => handleChange('kategori_item', e.target.value)}
                      />
                    ) : (
                      product.kategori_item
                    )}
                  </TableCell>
                  <TableCell>
                    {editingRowIndex === index ? (
                      <TextField
                        size="small"
                        type="number"
                        value={editedFields.harga_item ?? product.harga_item}
                        onChange={(e) => handleChange('harga_item', Number(e.target.value))}
                      />
                    ) : (
                      product.harga_item
                    )}
                  </TableCell>
                  <TableCell>
                    {editingRowIndex === index ? (
                      <TextField
                        size="small"
                        type="number"
                        value={editedFields.qty_item ?? product.qty_item}
                        onChange={(e) => handleChange('qty_item', Number(e.target.value))}
                      />
                    ) : (
                      product.qty_item
                    )}
                  </TableCell>
                  <TableCell>
                    {editingRowIndex === index ? (
                      <TextField
                        size="small"
                        value={editedFields.satuan_item ?? product.satuan_item}
                        onChange={(e) => handleChange('satuan_item', e.target.value)}
                      />
                    ) : (
                      product.satuan_item
                    )}
                  </TableCell>
                  <TableCell>
                    {editingRowIndex === index ? (
                      <Button size="small" variant="contained" color="primary" onClick={() => handleSave(product)}>
                        Save
                      </Button>
                    ) : (
                      <Button size="small" variant="contained" color="warning" onClick={() => setEditingRowIndex(index)}>
                        Edit
                      </Button>
                    )}
                    <Button
                      size="small"
                      variant="contained"
                      color="secondary"
                      onClick={() => handleDelete(product)}
                      sx={{ ml: 1 }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </DashboardContent>
  );
};

export default ProductTable;
