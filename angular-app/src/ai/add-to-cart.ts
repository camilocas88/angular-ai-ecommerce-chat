import { z } from 'zod';

const addToCartTool = {
  name: 'add-to-cart',
  description: 'Add product to cart. Use when user wants to buy/add/purchase items.',
  inputSchema: z.object({
    id: z.string().describe('Product ID from the available products list'),
    quantity: z.number().min(1).default(1).describe('How many items to add'),
    productName: z.string().describe('Name of the product being added'),
    productList: z.array(z.string()).optional().describe('Available products'),
  }),
  outputSchema: z.object({
    message: z.string().describe('Success message'),
    action: z.object({
      type: z.literal('addToCart'),
      params: z.object({
        id: z.string(),
        quantity: z.number(),
      })
    })
  }),
};

const addToCartToolFn = async (
  input: z.infer<typeof addToCartTool.inputSchema>
): Promise<z.infer<typeof addToCartTool.outputSchema>> => {
  console.log('🔧 add-to-cart tool called:', input);

  const result = {
    message: `Adding ${input.quantity} x ${input.productName} to cart`,
    action: {
      type: 'addToCart' as const,
      params: {
        id: input.id,
        quantity: input.quantity,
      }
    }
  };

  console.log('✅ Tool returning:', result);
  return result;
};

export { addToCartTool, addToCartToolFn };
