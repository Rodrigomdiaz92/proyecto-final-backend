const {promises: fs} = require('fs');

class Contenedor{
    constructor(nombreArchivo){
        this.nombreArchivo = nombreArchivo; 
        this.productos = [],
        this.id=1
    }

    async save(obj){
        try {
            obj.id = this.id;
            this.productos = [...this.productos, obj];
            await fs.writeFile('./'+this.nombreArchivo+'.json', JSON.stringify(this.productos)+'\n');
            this.id ++; 
        } catch (error) {
            console.log('Hubo un error');
        }
    }
    
    async getById(id){
        try {
           const producto = await this.getAll();
           const productsById = producto.find(p => p.id == id);
           return productsById;  
        } catch (error) {
            console.log('Hubo un error')
        }
    }

    async getAll(){
        try {
            const productos = await fs.readFile('./'+this.nombreArchivo+'.json', 'utf8');
            this.productos = JSON.parse( productos);
            console.log(JSON.stringify(this.productos));
            this.id = this.productos.length + 1;
            return JSON.parse(JSON.stringify(this.productos));
        } catch (error) {
            console.log('Hubo un error');
        }
    }

    async update(prod, id){
        try {
            prod.id = id;
            this.productos[id - 1] = prod;
            await fs.writeFile('./'+this.nombreArchivo+'.json', JSON.stringify(this.productos));
        } catch (error) {
            console.log('Hubo un error');
        }
    }

    async deleteById(id){
        try {
          const producto = await this.getAll();
          const productsById = producto.filter(p => p.id != id);
          this.productos = productsById
          await fs.writeFile('./'+this.nombreArchivo+'.json', JSON.stringify(this.productos));  
        } catch (error) {
           console.log('Hubo un error'); 
        }
    }
    
    async deleteAll(){
        this.productos = [];
        this.id = 1;
        await fs.writeFile('./'+this.nombreArchivo+'.json', JSON.stringify(this.productos));
    }
}

module.exports = Contenedor;