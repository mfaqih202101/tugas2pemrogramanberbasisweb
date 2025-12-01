var myStokApp = new Vue({
    el: '#mainApp',
    data: {
        // Mengambil data awal dari variabel global "app"
        upbjjList: (typeof app !== 'undefined' && app.upbjjList) || [], 
        kategoriList: (typeof app !== 'undefined' && app.kategoriList) || [], 
        stokData: (typeof app !== 'undefined' && app.stok) || [],

        // Object untuk menyimpan state filter dan sorting
        filter: { upbjj: '', lowStock: false, emptyStock: false }, 
        sortBy: 'default', 
        
        // Konfigurasi Modal (Pop-up)
        modalTitle: 'Tambah Bahan Ajar', 
        isEditMode: false,
        editIndex: null, 

        form: { kode: '', judul: '', kategori: '', upbjj: '', lokasiRak: '', harga: 0, qty: 0, safety: 0, catatanHTML: '' },
        
        bsModal: null
    },

    mounted() {

        const modalEl = document.getElementById('stokModal');

        if(modalEl) this.bsModal = new bootstrap.Modal(modalEl);
    },

   
    computed: {
      
        totalRestock: function() {
            return this.stokData.filter(i => i.qty < i.safety).length;
        },

        // Logika utama untuk memfilter dan mengurutkan data stok
        filteredStok: function() {
            let result = this.stokData; 

            //Filter berdasarkan UPBJJ
            if (this.filter.upbjj) result = result.filter(i => i.upbjj === this.filter.upbjj);
            
            //Filter berdasarkan Status Stok (Low Stock atau Empty Stock)
            if (this.filter.lowStock || this.filter.emptyStock) {
                result = result.filter(item => {
                    const isLow = item.qty < item.safety && item.qty > 0; 
                    const isEmpty = item.qty === 0; 
                    
                    //Tampilkan jika salah satu kondisi filter terpenuhi
                    if (this.filter.lowStock && this.filter.emptyStock) return isLow || isEmpty;
                    if (this.filter.lowStock) return isLow;
                    if (this.filter.emptyStock) return isEmpty;
                });
            }

            //Sorting (Pengurutan)
            if (this.sortBy !== 'default') {
                result = result.slice().sort((a, b) => { 
                    if (this.sortBy === 'judul') return a.judul.localeCompare(b.judul); 
                    if (this.sortBy === 'stok') return a.qty - b.qty; 
                });
            }
            return result; 
        }
    },

    
    methods: {
       
        formatRupiah(val) { return "Rp " + (val||0).toLocaleString('id-ID'); },
        
        // Membuka modal untuk menambah data baru
        bukaModalTambah() {
            this.modalTitle = "Tambah Bahan Ajar"; 
            this.isEditMode = false; 
            
            this.form = { kode: '', judul: '', kategori: '', upbjj: '', lokasiRak: '', harga: 0, qty: 0, safety: 0, catatanHTML: '' };
            this.bsModal.show(); 
        },

        // Membuka modal untuk mengedit data yang ada
        bukaModalEdit(item) {
            this.modalTitle = "Edit Bahan Ajar"; 
            this.isEditMode = true; 
            this.editIndex = this.stokData.indexOf(item); 
            this.form = { ...item }; 
            this.bsModal.show(); 
        },

        // Menyimpan data
        simpanData() {
            if (this.isEditMode) 
                
                this.$set(this.stokData, this.editIndex, { ...this.form });
            else 
                
                this.stokData.push({ ...this.form });
            
            this.bsModal.hide(); 
            alert("Data Berhasil Disimpan"); 
        },

        // Menghapus data
        hapusData(item) {
            
            if(confirm("Yakin hapus " + item.judul + "?")) {
                const idx = this.stokData.indexOf(item); 
                if (idx > -1) this.stokData.splice(idx, 1); 
            }
        }
    }
});