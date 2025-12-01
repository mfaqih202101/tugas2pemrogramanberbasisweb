var trackApp = new Vue({
    el: '#trackingApp',
    data: {
        // Mengambil data referensi dari global 'app'
        pengirimanList: (typeof app !== 'undefined' && app.pengirimanList) || [], 
        paketList: (typeof app !== 'undefined' && app.paket) || [], 
        
        
       
        trackingList: (typeof app !== 'undefined' && app.tracking) ? Object.keys(app.tracking).map(key => {
            return { noDO: key, ...app.tracking[key] }; 
        }) : [],

        searchQuery: '', 
        isDarkMode: false, 
        
        
        bsModalDO: null, 
        bsModalDetail: null, 
        bsToast: null, 

        // Model Form Input DO Baru
        form: { nim: '', nama: '', ekspedisi: '', paket: '', tanggalKirim: new Date().toISOString().slice(0,10), total: 0 },
        selectedItem: null 
    },
    mounted() {
        
        this.bsModalDO = new bootstrap.Modal(document.getElementById('modalDO'));
        this.bsModalDetail = new bootstrap.Modal(document.getElementById('detailModal'));
        
     
        const toastEl = document.getElementById('trackToast');
        if(toastEl) this.bsToast = new bootstrap.Toast(toastEl);

       
        if(localStorage.getItem('theme') === 'dark') {
            this.isDarkMode = true;
            document.body.setAttribute('data-theme', 'dark');
        }
    },


    computed: {
        // Filter Tracking: Memfilter trackingList berdasarkan searchQuery
        filteredTracking: function() {
            if(!this.searchQuery) return this.trackingList; 
            const q = this.searchQuery.toLowerCase(); // 
            // Filter berdasarkan No DO ATAU Nama
            return this.trackingList.filter(i => i.noDO.toLowerCase().includes(q) || i.nama.toLowerCase().includes(q));
        },

        // Generate Nomor DO Otomatis
        generatedDONumber: function() {
            // Format: DO[Tahun]-[Sequence 4 digit]
            const seq = String(this.trackingList.length + 1).padStart(4, '0');
            return `DO${new Date().getFullYear()}-${seq}`;
        }
    },

    methods: {
        // Format Rupiah
        formatRupiah(val) { return "Rp " + (val||0).toLocaleString('id-ID'); },
        
        toggleTheme() {
            this.isDarkMode = !this.isDarkMode;
            if(this.isDarkMode) {
                document.body.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
            }
        },

        showToast(msg, type='success') {
            if(!this.bsToast) return;
            const el = document.getElementById('trackToast');
            const msgEl = document.getElementById('trackToastMsg');
            
            msgEl.innerText = msg; 
            el.className = `toast align-items-center text-white border-0 bg-${type}`;
            
            this.bsToast.show(); 
        },
        
        // Buka Modal Form DO Baru
        bukaModalDO() { this.bsModalDO.show(); },
        
        // Buka Modal Detail dan set item yang dipilih
        lihatDetail(item) {
            this.selectedItem = item;
            this.bsModalDetail.show();
        },

        // Submit DO Baru
        submitDO() {
            // Buat objek DO baru
            const newDO = {
                noDO: this.generatedDONumber, 
                nim: this.form.nim, 
                nama: this.form.nama, 
                ekspedisi: this.form.ekspedisi,
                paket: this.form.paket, 
                tanggalKirim: this.form.tanggalKirim, 
                total: this.form.total,
                status: "Diproses", 
                // Buat history perjalanan awal
                perjalanan: [{ waktu: new Date().toLocaleString('id-ID'), keterangan: "Pesanan dibuat" }]
            };
            
            this.trackingList.unshift(newDO); 
            this.bsModalDO.hide(); 
            
            
            this.showToast(`DO ${newDO.noDO} berhasil dibuat!`, 'success');
        },

        // Hapus DO
        hapusDO(item) {
            if(confirm("Yakin hapus DO " + item.noDO + "?")) {
                const idx = this.trackingList.indexOf(item);
                if (idx > -1) {
                    this.trackingList.splice(idx, 1); 

                    this.showToast("Data DO berhasil dihapus", "danger");
                }
            }
        },

    
        cetakInvoice(item) {

            this.showToast("Sedang mencetak invoice " + item.noDO + "...", "primary");
        }
    },


    watch: {
        'form.paket': function(val) {
            // Cari data paket yang dipilih berdasarkan kode
            const p = this.paketList.find(i => i.kode === val);
            if(p) this.form.total = p.harga;
        }
    }
});