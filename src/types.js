// src/types.js
// Berkas konstanta berisi konfigurasi emosi, daftar misi awal, dan kutipan harian.

export const MOOD_CONFIGS = {
  Senang: {
    type: "Senang",
    label: "Senang",
    icon: "😄",
    color: "from-yellow-400 to-amber-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
    textColor: "text-yellow-400",
    description: "Cahaya batinmu bersinar benderang!"
  },
  Tenang: {
    type: "Tenang",
    label: "Tenang",
    icon: "🌿",
    color: "from-emerald-400 to-teal-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    textColor: "text-emerald-400",
    description: "Kedamaian batin selaras dengan semesta."
  },
  Lelah: {
    type: "Lelah",
    label: "Lelah",
    icon: "💤",
    color: "from-blue-400 to-indigo-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    textColor: "text-blue-400",
    description: "Waktunya berteduh dan memulihkan energi."
  },
  Gelisah: {
    type: "Gelisah",
    label: "Gelisah",
    icon: "🌪️",
    color: "from-rose-400 to-pink-500",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/30",
    textColor: "text-rose-400",
    description: "Tarik napas, biarkan badai batin berlalu."
  }
};

export const INITIAL_QUESTS = [
  {
    id: "cemas-1",
    title: "Langkah Melambat",
    description: "Pikiranmu sedang berlari cepat. Mari melambat sejenak. Sebutkan dalam hati: 5 benda yang bisa kamu lihat saat ini, dan 4 benda yang bisa kamu sentuh.",
    duration: "5 Menit",
    rewardXP: 50,
    rewardType: "Kesadaran",
    category: "Cemas / Khawatir",
    steps: [
      "Pejamkan mata sejenak, tarik napas dalam-dalam, lalu buka mata perlahan.",
      "Sebutkan benda ke-1 yang kamu lihat.",
      "Sebutkan benda ke-2 yang kamu lihat.",
      "Sebutkan benda ke-3 yang kamu lihat.",
      "Sebutkan benda ke-4 yang kamu lihat.",
      "Sebutkan benda ke-5 yang kamu lihat.",
      "Sekarang, rasakan sekelilingmu. Sentuh benda ke-1 yang bisa kamu sentuh.",
      "Sentuh benda ke-2 yang bisa kamu sentuh.",
      "Sentuh benda ke-3 yang bisa kamu sentuh.",
      "Sentuh benda ke-4 yang bisa kamu sentuh.",
      "Rasakan ketenangan batin mulai mengalir seiring melambatnya pikiranmu."
    ],
    currentStep: 0,
    isCompleted: false,
    isUnlocked: true,
    icon: "Compass",
    color: "text-teal-400 border-teal-500/30 bg-teal-500/5"
  },
  {
    id: "cemas-2",
    title: "Mengurai Kendali",
    description: "Ambil 5 menit untuk menulis apa yang paling kamu khawatirkan. Setelah itu tulis satu hal yang bisa kamu kendalikan dari situasi itu.",
    duration: "5 Menit",
    rewardXP: 55,
    rewardType: "Refleksi",
    category: "Cemas / Khawatir",
    steps: [
      "Ambil napas teratur dan siapkan diri untuk jujur pada perasaanmu.",
      "Tuliskan hal utama yang paling kamu khawatirkan saat ini.",
      "Renungkan apa saja faktor dari kekhawatiran itu yang berada di luar kendalimu.",
      "Tuliskan satu hal kecil yang secara nyata bisa kamu kendalikan dari situasi tersebut.",
      "Fokuskan energimu hanya pada hal yang bisa kamu kendalikan tersebut."
    ],
    currentStep: 0,
    isCompleted: false,
    isUnlocked: true,
    icon: "PenTool",
    color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/5"
  },
  {
    id: "cemas-3",
    title: "Memilah Fakta & Asumsi",
    description: "Tulis daftar kekhawatiranmu, lalu tandai mana yang fakta dan mana yang asumsi. Kecemasan sering berasal dari asumsi yang terasa seperti kepastian.",
    duration: "8 Menit",
    rewardXP: 60,
    rewardType: "Refleksi",
    category: "Cemas / Khawatir",
    steps: [
      "Ambil napas dalam, sadari bahwa pikiran cemas sering membuat asumsi terasa nyata.",
      "Tuliskan kekhawatiran pertama yang melintas di pikiranmu.",
      "Apakah kekhawatiran tersebut didukung oleh fakta objektif saat ini, ataukah itu sekadar asumsi/kemungkinan di masa depan?",
      "Tandai dengan tegas: mana yang benar-benar fakta dan mana yang merupakan asumsi.",
      "Biarkan asumsi itu meleleh dan fokuslah pada fakta nyata saat ini."
    ],
    currentStep: 0,
    isCompleted: false,
    isUnlocked: true,
    icon: "PenTool",
    color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/5"
  },
  {
    id: "cemas-4",
    title: "Berbagi Beban Pikiran",
    description: "Pilih satu orang yang kamu percaya dan ceritakan apa yang sedang kamu khawatirkan. Tidak perlu solusi cukup didengar saja sudah sangat membantu.",
    duration: "10 Menit",
    rewardXP: 65,
    rewardType: "Kesadaran",
    category: "Cemas / Khawatir",
    steps: [
      "Tarik napas perlahan. Ingatlah bahwa kamu tidak harus memikul semua ini sendirian.",
      "Pikirkan satu nama orang terdekat yang kamu percayai sepenuhnya.",
      "Hubungi atau kirim pesan singkat kepadanya untuk menceritakan apa yang sedang kamu khawatirkan.",
      "Sampaikan bahwa kamu hanya butuh didengar tanpa perlu solusi instan.",
      "Rasakan beban pikiranmu berkurang setelah membagikannya dengan orang lain."
    ],
    currentStep: 0,
    isCompleted: false,
    isUnlocked: true,
    icon: "Compass",
    color: "text-teal-400 border-teal-500/30 bg-teal-500/5"
  },
  {
    id: "marah-1",
    title: "Pernapasan Penenang Jiwa",
    description: "Tarik napas perlahan melalui hidung selama 4 detik. Tahan napasmu selama 7 detik. Embuskan perlahan melalui mulut selama 8 detik. Ulangi siklus ini 3 kali.",
    duration: "3 Menit",
    rewardXP: 50,
    rewardType: "Pernapasan",
    category: "Marah / Frustrasi",
    steps: [
      "Duduk dengan tegak, rilekskan bahu dan rahangmu.",
      "Tarik napas dalam melalui hidung perlahan selama 4 detik.",
      "Tahan napasmu dengan tenang selama 7 detik.",
      "Embuskan perlahan melalui mulut dengan lembut selama 8 detik.",
      "Ulangi siklus pernapasan 4-7-8 ini sebanyak 3 kali untuk mendinginkan bara kemarahan."
    ],
    currentStep: 0,
    isCompleted: false,
    isUnlocked: true,
    icon: "Wind",
    color: "text-rose-400 border-rose-500/30 bg-rose-500/5"
  },
  {
    id: "marah-2",
    title: "Mengurai Kebutuhan Batin",
    description: "Di balik setiap kemarahan biasanya ada kebutuhan yang tidak terpenuhi. Tanyakan ke dirimu: apa yang sebenarnya kamu butuhkan dari situasi ini?",
    duration: "5 Menit",
    rewardXP: 55,
    rewardType: "Refleksi",
    category: "Marah / Frustrasi",
    steps: [
      "Ambil posisi duduk yang tenang, biarkan emosimu mengalir tanpa menghakimi.",
      "Pikirkan situasi yang memicu kemarahan atau rasa frustrasimu saat ini.",
      "Tanyakan pada dirimu: 'Apa kebutuhan batiniahku yang belum terpenuhi dari situasi ini?'",
      "Tuliskan jawaban jujurmu (misalnya: butuh dihargai, didengar, atau butuh ruang istirahat).",
      "Sadarilah kebutuhan tersebut dan pikirkan cara sehat untuk memenuhinya."
    ],
    currentStep: 0,
    isCompleted: false,
    isUnlocked: true,
    icon: "PenTool",
    color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/5"
  },
  {
    id: "marah-3",
    title: "Kanalisasi Energi Kreatif",
    description: "Gambar sesuatu yang tidak perlu bagus. Atau tuliskan lirik, cerita pendek, atau puisi tentang perasaanmu. Kreasi adalah cara mengubah energi negatif menjadi sesuatu yang bermakna.",
    duration: "10 Menit",
    rewardXP: 70,
    rewardType: "Kesadaran",
    category: "Marah / Frustrasi",
    steps: [
      "Siapkan selembar kertas, buku catatan, atau kanvas digital.",
      "Mulai coretkan penamu secara bebas tanpa memikirkan hasilnya harus bagus.",
      "Gambarkan perasaanmu saat ini, atau tulis lirik, puisi, cerita pendek yang mewakili kemarahanmu.",
      "Rasakan energi marah tersebut mengalir dari pikiranmu melalui tangan ke atas media.",
      "Lihatlah hasil kreasimu sebagai transformasi energi negatif menjadi karya yang jujur."
    ],
    currentStep: 0,
    isCompleted: false,
    isUnlocked: true,
    icon: "Zap",
    color: "text-rose-400 border-rose-500/30 bg-rose-500/5"
  },
  {
    id: "lelah-1",
    title: "Ritual Pelepasan Layar",
    description: "Misimu sekarang sangat sederhana: Tinggalkan layarmu. Minum satu gelas penuh air putih hangat, dan regangkan kedua tanganmu ke atas selama 10 detik.",
    duration: "3 Menit",
    rewardXP: 45,
    rewardType: "Kesadaran",
    category: "Lelah",
    steps: [
      "Simpan gawai atau tatapan layarmu sejenak.",
      "Berdirilah dan tuangkan segelas air hangat.",
      "Minum air tersebut dengan penuh kesadaran seteguk demi seteguk.",
      "Angkat kedua tanganmu tinggi-tinggi ke atas, renggangkan seluruh tubuh selama 10 detik.",
      "Hembuskan napas panjang dan rasakan kesegaran mengalir di tubuhmu."
    ],
    currentStep: 0,
    isCompleted: false,
    isUnlocked: true,
    icon: "Compass",
    color: "text-teal-400 border-teal-500/30 bg-teal-500/5"
  },
  {
    id: "lelah-2",
    title: "Sapaan Tubuh",
    description: "Kelelahan sering diperparah oleh dehidrasi and lupa makan. Minum segelas air sekarang dan pastikan kamu sudah makan setidaknya sekali hari ini.",
    duration: "5 Menit",
    rewardXP: 45,
    rewardType: "Kesadaran",
    category: "Lelah",
    steps: [
      "Tarik napas, sadari sinyal yang dikirimkan oleh tubuhmu saat ini.",
      "Ambil segelas air putih segar dan minumlah hingga tuntas.",
      "Ingat kembali: Apakah kamu sudah makan dengan baik hari ini?",
      "Jika belum, jadwalkan atau santap makanan sehat kecil sekarang untuk mengembalikan tenagamu.",
      "Berterima kasihlah pada tubuhmu yang telah berjuang keras hari ini."
    ],
    currentStep: 0,
    isCompleted: false,
    isUnlocked: true,
    icon: "Coffee",
    color: "text-amber-400 border-amber-500/30 bg-amber-500/5"
  },
  {
    id: "burnout-1",
    title: "Memilah Beban Jiwa",
    description: "Tulis semua hal yang sedang kamu tanggung sekarang baik itu pekerjaan, hubungan, ekspektasi. Tandai mana yang bisa dilepas, didelegasikan, atau ditunda.",
    duration: "8 Menit",
    rewardXP: 60,
    rewardType: "Refleksi",
    category: "Burnout",
    steps: [
      "Duduk dengan nyaman, singkirkan semua gangguan luar.",
      "Tuliskan semua tanggung jawab, pekerjaan, dan ekspektasi yang menindih pikiranmu saat ini.",
      "Tinjau daftar tersebut secara rasional.",
      "Tandai mana beban yang bisa kamu lepaskan sepenuhnya.",
      "Tandai mana beban yang bisa didelegasikan kepada orang lain.",
      "Tandai mana beban yang bisa ditunda demi kesehatan mentalmu.",
      "Hembuskan napas lega, sadari bahwa kamu tidak harus melakukan semuanya sekaligus."
    ],
    currentStep: 0,
    isCompleted: false,
    isUnlocked: true,
    icon: "Layers",
    color: "text-indigo-400 border-indigo-500/30 bg-indigo-500/5"
  },
  {
    id: "sedih-1",
    title: "Deklarasi Tanpa Penghakiman",
    description: "Tidak apa-apa merasa sedih. Tuliskan apa yang kamu rasakan sekarang tanpa menghakimi diri sendiri dan tidak perlu ada solusi di akhir tulisan.",
    duration: "5 Menit",
    rewardXP: 55,
    rewardType: "Refleksi",
    category: "Sedih / Murung",
    steps: [
      "Sediakan waktu tenang tanpa interupsi, biarkan air mata atau rasa berat itu ada.",
      "Tuliskan perasaan sedih atau murungmu dengan jujur tanpa menyensor kata-katamu.",
      "Jangan menghakimi dirimu sendiri karena merasa sedih. Kesedihan adalah emosi manusiawi.",
      "Akhiri tulisanmu tanpa memikirkan solusi atau jalan keluar apa pun.",
      "Tutup catatanmu, peluk perasaanmu, dan katakan pada diri: 'Aku berharga apa adanya.'"
    ],
    currentStep: 0,
    isCompleted: false,
    isUnlocked: true,
    icon: "PenTool",
    color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/5"
  },
  {
    id: "sedih-2",
    title: "Playlist Pelukan Jiwa",
    description: "Buat playlist 15 menit berisi lagu yang terasa seperti pelukanmu. Izinkan dirimu hanya duduk dan mendengarkan tanpa melakukan hal lain.",
    duration: "15 Menit",
    rewardXP: 65,
    rewardType: "Kesadaran",
    category: "Sedih / Murung",
    steps: [
      "Siapkan earphone atau speaker andalanmu.",
      "Pilih 3 hingga 4 lagu lembut yang paling menenangkan batinmu.",
      "Pejamkan mata, bersandarlah dengan nyaman.",
      "Dengarkan alunan musik tersebut tanpa memikirkan pekerjaan atau hal lain.",
      "Biarkan melodi merangkul kesedihanmu dengan lembut."
    ],
    currentStep: 0,
    isCompleted: false,
    isUnlocked: true,
    icon: "CloudRain",
    color: "text-blue-400 border-blue-500/30 bg-blue-500/5"
  },
  {
    id: "senang-1",
    title: "Tabungan Energi Positif",
    description: "Karena hari ini berjalan baik, simpanlah energi ini. Tuliskan 1 hal sekecil apapun yang berhasil membuatmu tersenyum hari ini di jurnal esok pagi.",
    duration: "3 Menit",
    rewardXP: 50,
    rewardType: "Refleksi",
    category: "Senang / Bahagia",
    steps: [
      "Mengingat kembali kejadian menyenangkan sepanjang hari ini.",
      "Pilih satu momen, tawa, atau kejadian kecil yang memicu senyumanmu.",
      "Tuliskan momen tersebut di sini untuk diingat sebagai energi batin positif.",
      "Janji pada diri sendiri untuk membacanya kembali saat suasana hatimu redup.",
      "Simpan energi gembira ini dengan rasa syukur yang mendalam."
    ],
    currentStep: 0,
    isCompleted: false,
    isUnlocked: true,
    icon: "PenTool",
    color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/5"
  },
  {
    id: "senang-2",
    title: "Perayaan Kecil Jiwa",
    description: "Kamu berhak merayakan hal kecil. Lakukan satu hal sebagai bentuk apresiasi diri: makanan favorit, lagu kesukaan, atau istirahat tanpa rasa bersalah.",
    duration: "5 Menit",
    rewardXP: 50,
    rewardType: "Kesadaran",
    category: "Senang / Bahagia",
    steps: [
      "Tarik napas gembira. Sadari bahwa setiap pencapaian kecil layak diapresiasi.",
      "Pilih bentuk perayaan kecilmu hari ini (misalnya: makan camilan kesukaan, dengar lagu ceria).",
      "Lakukan hal tersebut dengan penuh kesenangan tanpa mencemaskan produktivitas.",
      "Nikmati waktu istirahat atau apresiasi diri ini tanpa ada rasa bersalah sedikit pun.",
      "Katakan pada diri sendiri: 'Terima kasih sudah melangkah sejauh ini.'"
    ],
    currentStep: 0,
    isCompleted: false,
    isUnlocked: true,
    icon: "Heart",
    color: "text-pink-400 border-pink-500/30 bg-pink-500/5"
  },
  {
    id: "senang-3",
    title: "Kabar Bahagia Menular",
    description: "Ceritakan satu hal yang membuatmu bahagia hari ini kepada seseorang yang kamu percaya lewat pesan singkat, obrolan, atau cerita langsung.",
    duration: "5 Menit",
    rewardXP: 55,
    rewardType: "Kesadaran",
    category: "Senang / Bahagia",
    steps: [
      "Pikirkan seorang teman, keluarga, atau pasangan yang senang mendengar kabarmu.",
      "Tulis pesan singkat atau hubungi mereka secara langsung.",
      "Bagikan momen bahagia yang kamu rasakan hari ini secara tulus.",
      "Nikmati reaksi positif dan rasakan kebahagiaanmu berlipat ganda karena dibagikan.",
      "Sadarilah bahwa menyebarkan kegembiraan juga menyembuhkan batinmu sendiri."
    ],
    currentStep: 0,
    isCompleted: false,
    isUnlocked: true,
    icon: "Compass",
    color: "text-teal-400 border-teal-500/30 bg-teal-500/5"
  },
  {
    id: "antusias-1",
    title: "Kirim Percikan Inspirasi",
    description: "Hubungi satu orang yang sedang kamu pikirkan dan katakan satu hal yang menginspirasimu darinya. Semangat itu menular.",
    duration: "5 Menit",
    rewardXP: 55,
    rewardType: "Kesadaran",
    category: "Antusias / Harap",
    steps: [
      "Pikirkan seseorang dalam hidupmu yang memiliki kualitas atau karya yang kamu kagumi.",
      "Siapkan pesan apresiasi yang tulus untuk dikirimkan kepadanya.",
      "Katakan dengan jujur apa hal dari dirinya yang menginspirasimu.",
      "Kirimkan pesan tersebut dan biarkan gelombang inspirasi mengalir di antara kalian.",
      "Rasakan semangat membara kembali di dalam dadamu."
    ],
    currentStep: 0,
    isCompleted: false,
    isUnlocked: true,
    icon: "Compass",
    color: "text-teal-400 border-teal-500/30 bg-teal-500/5"
  },
  {
    id: "antusias-2",
    title: "Memulai 5 Menit",
    description: "Pilih satu hal kecil yang sudah lama ingin kamu coba tapi selalu ditunda. Lakukan hanya 5 menit saja hari ini cukup memulai.",
    duration: "5 Menit",
    rewardXP: 55,
    rewardType: "Kesadaran",
    category: "Antusias / Harap",
    steps: [
      "Pikirkan hobi, buku, ketrampilan, atau hal baru yang selalu kamu tunda pelaksanaannya.",
      "Setel pengingat waktu (timer) selama 5 menit saja.",
      "Mulai lakukan aktivitas tersebut sekarang tanpa menuntut kesempurnaan.",
      "Fokuslah sepenuhnya pada proses selama 5 menit tersebut.",
      "Hentikan jika waktu habis, dan hargai langkah awal yang luar biasa ini."
    ],
    currentStep: 0,
    isCompleted: false,
    isUnlocked: true,
    icon: "Sparkles",
    color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/5"
  },
  {
    id: "antusias-3",
    title: "Satu Langkah Esok Hari",
    description: "Tuliskan satu langkah kecil yang bisa kamu lakukan besok untuk mendekati tujuanmu. Satu langkah saja tidak perlu rencana besar.",
    duration: "4 Menit",
    rewardXP: 50,
    rewardType: "Refleksi",
    category: "Antusias / Harap",
    steps: [
      "Pikirkan impian atau sasaran besar yang ingin kamu capai di masa depan.",
      "Uraikan impian besar itu menjadi potongan-potongan langkah yang sangat kecil.",
      "Tuliskan satu tindakan spesifik dan sangat mudah yang bisa kamu jalankan besok pagi.",
      "Sadarilah bahwa samudera luas terbentuk dari tetesan-tetesan air kecil.",
      "Mantapkan tekadmu untuk melakukan satu langkah kecil tersebut besok."
    ],
    currentStep: 0,
    isCompleted: false,
    isUnlocked: true,
    icon: "PenTool",
    color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/5"
  },
  {
    id: "putusasa-1",
    title: "Secercah Rasa Syukur",
    description: "Di tengah perasaan putus asa, coba tulis satu hal sekecil apapun yang masih ada atau masih bisa kamu syukuri. Satu sudah cukup untuk hari ini.",
    duration: "5 Menit",
    rewardXP: 55,
    rewardType: "Refleksi",
    category: "Putus asa",
    steps: [
      "Duduk tenang, rasakan napasmu yang berhembus perlahan.",
      "Meskipun segalanya terasa gelap, carilah satu hal kecil yang masih bertahan di sisimu.",
      "Bisa jadi berupa hembusan napas hangat, atap pelindung, atau segelas air.",
      "Tuliskan satu hal tersebut di sini dengan tulus.",
      "Fokuslah pada kehangatan dari hal kecil tersebut, biarkan ia menjadi pelita kecil di kegelapan."
    ],
    currentStep: 0,
    isCompleted: false,
    isUnlocked: true,
    icon: "PenTool",
    color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/5"
  },
  {
    id: "putusasa-2",
    title: "Sinyal Penyelamat",
    description: "Ada seseorang yang peduli padamu. Kirimkan pesan singkat kepada mereka tidak perlu cerita panjang. Cukup beri tahu bahwa kamu sedang tidak baik-baik saja.",
    duration: "5 Menit",
    rewardXP: 60,
    rewardType: "Kesadaran",
    category: "Putus asa",
    steps: [
      "Ambil gawaumu, pejamkan mata sejenak, sadari bahwa kamu tidak sendiri.",
      "Pikirkan satu orang terdekat yang peduli dan menyayangimu apa adanya.",
      "Ketik pesan singkat: 'Hai, aku sedang merasa kurang baik saat ini. Hanya ingin berkabar.'",
      "Kirim pesan tersebut tanpa merasa terbebani untuk menjelaskan panjang lebar.",
      "Tunggu balasan hangat mereka dan biarkan kepedulian mereka merengkuh jiwamu."
    ],
    currentStep: 0,
    isCompleted: false,
    isUnlocked: true,
    icon: "Compass",
    color: "text-teal-400 border-teal-500/30 bg-teal-500/5"
  },
  {
    id: "putusasa-3",
    title: "Jangkar Detik Ini",
    description: "Tidak perlu bangkit sepenuhnya hari ini. Cukup lakukan satu hal paling kecil yang bisa kamu lakukan: minum air, buka jendela, atau duduk tegak selama 1 menit.",
    duration: "3 Menit",
    rewardXP: 45,
    rewardType: "Kesadaran",
    category: "Putus asa",
    steps: [
      "Jangan membebani dirimu untuk langsung merasa bersemangat atau bahagia.",
      "Pilih satu tindakan sangat sederhana: minum seteguk air, membuka sedikit jendela, atau sekadar menegakkan punggungmu.",
      "Lakukan tindakan kecil yang kamu pilih tersebut selama 1 menit dengan penuh kesadaran.",
      "Sadari bahwa kamu berhasil melewati menit ini dengan selamat.",
      "Hargai kekuatan kecil yang ada di dalam tubuhmu saat ini."
    ],
    currentStep: 0,
    isCompleted: false,
    isUnlocked: true,
    icon: "Anchor",
    color: "text-violet-400 border-violet-500/30 bg-violet-500/5"
  },
  {
    id: "isolasi-1",
    title: "Sentuhan Angin Luar",
    description: "Tidak perlu keluar. Cukup duduk di dekat jendela, buka sedikit, dan biarkan udara atau cahaya masuk. Kontak dengan lingkungan luar meskipun kecil bisa membantu.",
    duration: "4 Menit",
    rewardXP: 50,
    rewardType: "Kesadaran",
    category: "Isolasi diri",
    steps: [
      "Dekati jendela terdekat di dalam ruanganmu.",
      "Buka jendela tersebut perlahan-lahan agar udara luar mengalir masuk.",
      "Duduklah dengan tenang di dekat jendela tersebut.",
      "Rasakan belaian lembut embusan angin atau kehangatan sinar matahari menyentuh kulitmu.",
      "Dengarkan sayup-sayup suara dari luar, sadari keterhubunganmu dengan dunia luar."
    ],
    currentStep: 0,
    isCompleted: false,
    isUnlocked: true,
    icon: "Compass",
    color: "text-teal-400 border-teal-500/30 bg-teal-500/5"
  },
  {
    id: "isolasi-2",
    title: "Kehadiran Tanpa Tekanan",
    description: "Kamu tidak harus berinteraksi aktif. Coba duduk di ruang yang ada orang lain (kafe, perpustakaan, ruang keluarga) tanpa kewajiban berbicara. Kehadiran orang lain bisa membantu tanpa tekanan sosial.",
    duration: "10 Menit",
    rewardXP: 65,
    rewardType: "Kesadaran",
    category: "Isolasi diri",
    steps: [
      "Persiapkan dirimu untuk pergi to ruang publik terdekat (misal: kafe, perpustakaan, ruang keluarga).",
      "Cari posisi duduk yang nyaman di antara keramaian kecil.",
      "Kamu tidak perlu menyapa atau berbicara dengan siapa pun jika belum siap.",
      "Cukup nikmati suasana di sekitarmu, amati aktivitas hangat orang lain.",
      "Rasakan energi sosial mengalir di sekitarmu, ketahuilah bahwa kamu adalah bagian dari semesta ini."
    ],
    currentStep: 0,
    isCompleted: false,
    isUnlocked: true,
    icon: "Compass",
    color: "text-teal-400 border-teal-500/30 bg-teal-500/5"
  },
  {
    id: "senang-1",
    title: "Kapsul Waktu Kebahagiaan",
    description: "Saat kamu merasa tenang atau senang, ini adalah waktu terbaik untuk menabung memori bahagia. Tuliskan 3 hal kecil yang membuatmu tersenyum hari ini.",
    duration: "5 Menit",
    rewardXP: 50,
    rewardType: "Syukur",
    category: "Senang / Bahagia",
    steps: [
      "Tarik napas dalam, rasakan kelegaan dan kedamaian di hatimu.",
      "Tuliskan hal pertama yang membuatmu tersenyum hari ini.",
      "Tuliskan hal kedua yang kamu syukuri.",
      "Tuliskan hal ketiga sekecil apa pun itu.",
      "Biarkan perasaan hangat ini menetap di dalam dirimu sepanjang sisa hari."
    ],
    currentStep: 0,
    isCompleted: false,
    isUnlocked: true,
    icon: "Sparkles",
    color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/5"
  },
  {
    id: "senang-2",
    title: "Surat Untuk Diri Sendiri",
    description: "Tuliskan satu pesan singkat penuh kasih sayang untuk dirimu di masa depan saat kamu mungkin sedang merasa sedih. Gunakan energi positifmu saat ini sebagai perisai masa depan.",
    duration: "7 Menit",
    rewardXP: 60,
    rewardType: "Refleksi",
    category: "Senang / Bahagia",
    steps: [
      "Siapkan catatan dan resapi ketenangan batin yang kamu miliki sekarang.",
      "Tulis 'Hai diriku di masa depan, saat ini aku sedang merasa kuat dan bahagia...'",
      "Tuliskan kata-kata semangat yang ingin kamu dengar jika kamu sedang terpuruk kelak.",
      "Baca ulang surat tersebut dengan penuh kelembutan.",
      "Simpan pesan ini dengan baik sebagai 'surat cinta' untuk dirimu."
    ],
    currentStep: 0,
    isCompleted: false,
    isUnlocked: true,
    icon: "Heart",
    color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5"
  }
];

export const DAILY_QUOTES = [
  "Langkah terkecil sekalipun adalah awal dari sebuah legenda baru.",
  "Pikiranmu adalah peta rahasiamu sendiri, petualangilah dengan penuh kasih sayang.",
  "Bintang terindah hanya bersinar di malam yang paling pekat.",
  "Napasmu adalah jangkar kedamaian batin di tengah badai kehidupan.",
  "Hari ini adalah halaman kosong yang siap dituliskan dengan tinta ketenangan batin.",
  "Sama seperti dahan pohon, jadilah fleksibel dalam menghadapi badai kehidupan."
];
