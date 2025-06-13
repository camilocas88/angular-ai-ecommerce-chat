// Import data directly
import { data } from '../src/data';

interface Product {
  id: string;
  name: string;
  description: string;
  category_ids: string[];
  images: string[];
  price: number;
  discount_price: number;
  availability: 'normal' | 'low' | 'none';
  parameters?: Array<{
    name: string;
    value: string;
  }>;
  created_at: string;
}

interface GetProductsParams {
  categoryId?: string;
  pageSize?: number;
  page?: number;
  name?: string;
  sortBy?: 'price_asc' | 'price_desc';
  fromPrice?: number;
  toPrice?: number;
  batchIds?: string[];
}

async function getProducts(tech: 'angular' | 'react', params?: GetProductsParams): Promise<Product[]> {
  let filtered = data[tech].products as Product[];

  if (params?.categoryId) {
    filtered = filtered.filter((p: Product) => p.category_ids.includes(params.categoryId!));
  }

  if (params?.name) {
    filtered = filtered.filter((p: Product) =>
      p.name.toLowerCase().includes(params.name!.toLowerCase())
    );
  }

  if (params?.fromPrice) {
    filtered = filtered.filter((p: Product) => p.price >= params.fromPrice!);
  }

  if (params?.toPrice) {
    filtered = filtered.filter((p: Product) => p.price <= params.toPrice!);
  }

  if (params?.sortBy === 'price_asc') {
    filtered = filtered.sort((a: Product, b: Product) => a.price - b.price);
  } else if (params?.sortBy === 'price_desc') {
    filtered = filtered.sort((a: Product, b: Product) => b.price - a.price);
  }

  if (params?.page && params?.pageSize) {
    const start = (params.page - 1) * params.pageSize;
    filtered = filtered.slice(start, start + params.pageSize);
  }

  return filtered;
}

export default async function handler(req: any, res: any) {
  try {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const { categoryId, pageSize, page, name, sortBy, fromPrice, toPrice, batchIds, tech } = req.query;

    const techParam = tech as 'angular' | 'react';
    if (!techParam || (techParam !== 'angular' && techParam !== 'react')) {
      // Default to angular if tech is not specified
      const defaultTech = 'angular';

      const params = {
        categoryId: categoryId as string,
        pageSize: pageSize ? Number(pageSize) : undefined,
        page: page ? Number(page) : undefined,
        name: name as string,
        sortBy: sortBy as 'price_asc' | 'price_desc',
        fromPrice: fromPrice ? Number(fromPrice) : undefined,
        toPrice: toPrice ? Number(toPrice) : undefined,
        batchIds: batchIds ? (Array.isArray(batchIds) ? batchIds : [batchIds]) as string[] : undefined
      };

      const products = await getProducts(defaultTech, params);
      res.status(200).json(products);
      return;
    }

    const params = {
      categoryId: categoryId as string,
      pageSize: pageSize ? Number(pageSize) : undefined,
      page: page ? Number(page) : undefined,
      name: name as string,
      sortBy: sortBy as 'price_asc' | 'price_desc',
      fromPrice: fromPrice ? Number(fromPrice) : undefined,
      toPrice: toPrice ? Number(toPrice) : undefined,
      batchIds: batchIds ? (Array.isArray(batchIds) ? batchIds : [batchIds]) as string[] : undefined
    };

    const products = await getProducts(techParam, params);
    res.status(200).json(products);

  } catch (error) {
    console.error('Error in products API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
