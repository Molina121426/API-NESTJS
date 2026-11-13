/**
 * Modelo de dominio de un producto.
 *
 * En una aplicación con base de datos, esta clase se decora con las
 * anotaciones del ORM (por ejemplo, @Entity() de TypeORM) y sus propiedades
 * pasan a ser columnas. El resto de la aplicación no necesita cambiar.
 */
export class Producto {
  constructor(
    public readonly id: number,
    public nombre: string,
    public descripcion: string,
    public precio: number,
    public stock: number,
    public categoria: string,
    public sku: string,
    public activo: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}
