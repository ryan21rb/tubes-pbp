# 📊 Kode Diagram UML & ERD (PlantUML & Mermaid)
**PhilanthropyChain dApp**

Dokumen ini berisi kode teks diagram UML Class Diagram (untuk Smart Contracts) dan Database ERD (Entity Relationship Diagram) yang disesuaikan dengan struktur proyek Anda. 

Anda dapat langsung menyalin (copy-paste) kode di bawah ini untuk dimasukkan ke **draw.io** (fitur **Arrange > Insert > Advanced > PlantUML** atau **Mermaid**).

---

## 1. Smart Contract UML Class Diagram (Sesuai Foto Slide)
Gunakan kode ini untuk mereplikasi Class Diagram kontrak pintar yang ada pada foto presentasi Anda.

### A. Kode PlantUML (Disarankan untuk draw.io)
```plantuml
@startuml
class PhilanthropyCore <<SmartContract>> {
    + version : string
    - campaigns : mapping(uint256 => Campaign)
    + verifiedRecipients : mapping(address => bool)
    + verifiedInstitutions : mapping(address => bool)
    + DISTRIBUTOR_ROLE : bytes32
    --
    + createCampaign(target: uint256, duration: uint256, zkProof: bytes)
    + donate(campaignId: uint256) : payable
    + distributeFunds(campaignId: uint256)
    - splitPayment(amount: uint256, category: uint8)
}

class Groth16Verifier <<SmartContract>> {
    + verifyProof(proof: bytes, input: uint256[]) : bool
}

PhilanthropyCore ..> Groth16Verifier : "Mengecek Bukti (Calls)"
@endum
```

### B. Kode Mermaid
```mermaid
classDiagram
    class PhilanthropyCore {
        <<SmartContract>>
        +string version
        -mapping campaigns
        +mapping verifiedRecipients
        +mapping verifiedInstitutions
        +bytes32 DISTRIBUTOR_ROLE
        +createCampaign(uint256 target, uint256 duration, bytes zkProof)
        +donate(uint256 campaignId) payable
        +distributeFunds(uint256 campaignId)
        -splitPayment(uint256 amount, uint8 category)
    }

    class Groth16Verifier {
        <<SmartContract>>
        +verifyProof(bytes proof, uint256[] input) bool
    }

    PhilanthropyCore ..> Groth16Verifier : Mengecek Bukti (Calls)
```

---

## 2. Smart Contract UML Class Diagram (Sesuai Kode Aktual/Asli Project)
Jika Anda membutuhkan UML yang menggambarkan struktur kontrak pintar yang **saat ini ada di project Anda** (`PovertyCheck.sol` dan `verifier.sol`).

### A. Kode PlantUML (Disarankan untuk draw.io)
```plantuml
@startuml
interface IZKVerifier {
    + verifyProof(a: uint256[2], b: uint256[2][2], c: uint256[2], input: uint256[1]) : bool
}

class PovertyCheck <<SmartContract>> {
    + admin : address
    + zkVerifierAddress : address
    --
    + updateVerifier(_newVerifier: address)
    + verifyPovertyStatus(a: uint256[2], b: uint256[2][2], c: uint256[2], input: uint256[1]) : bool
}

class Groth16Verifier <<SmartContract>> {
    + verifyProof(_pA: uint256[2], _pB: uint256[2][2], _pC: uint256[2], _pubSignals: uint256[3]) : bool
}

PovertyCheck ..> IZKVerifier : "Memanggil (Calls)"
Groth16Verifier ..|> IZKVerifier : "Mengimplementasikan"
@endum
```

---

## 3. Database Entity Relationship Diagram (ERD)
Gunakan diagram ini untuk menggambarkan struktur tabel basis data Laravel (MySQL/PostgreSQL) beserta relasi antar-tabelnya (User, Document, Campaign, Comments, Reports, dll.).

### A. Kode PlantUML (Disarankan untuk draw.io)
```plantuml
@startuml
!theme plain
hide circle
skinparam linetype ortho

entity "users" as users {
  * id : bigint(20) [PK]
  --
  * name : varchar(255)
  * wallet_address : varchar(255) [UQ]
  email : varchar(255) [nullable, UQ]
  password : varchar(255) [nullable]
  nonce : varchar(255) [nullable]
  role : enum('yayasan','instansi','donatur','penerima')
  instansi_type : varchar(255) [nullable]
  remember_token : varchar(100) [nullable]
  created_at : timestamp
  updated_at : timestamp
}

entity "documents" as documents {
  * id : bigint(20) [PK]
  --
  user_id : bigint(20) [FK -> users.id, nullable]
  * file_name : varchar(255)
  * file_path : varchar(255)
  * file_size : int
  * mime_type : varchar(255)
  * ipfs_cid : varchar(255)
  nama : varchar(255) [nullable]
  nik : varchar(255) [nullable]
  kategori : varchar(255) [nullable]
  keterangan : text [nullable]
  details : json [nullable]
  wallet_address : varchar(255) [nullable]
  * status : enum('menunggu','disetujui','ditolak')
  * tahap_bantuan : varchar(255)
  signed_by : json [nullable]
  rejected_by : json [nullable]
  created_at : timestamp
  updated_at : timestamp
}

entity "document_approvals" as approvals {
  * id : bigint(20) [PK]
  --
  * document_id : bigint(20) [FK -> documents.id]
  * node_wallet_address : varchar(255)
  * status : varchar(255)
  created_at : timestamp
  updated_at : timestamp
}

entity "campaigns" as campaigns {
  * id : bigint(20) [PK]
  --
  user_id : bigint(20) [FK -> users.id, nullable]
  * title : varchar(255)
  * description : text
  * category : varchar(255)
  * target_donation : double
  * collected_donation : double
  * status : varchar(255)
  image_url : varchar(255) [nullable]
  created_at : timestamp
  updated_at : timestamp
}

entity "campaign_comments" as comments {
  * id : bigint(20) [PK]
  --
  * campaign_id : bigint(20) [FK -> campaigns.id]
  * user_name : varchar(255)
  * comment : text
  created_at : timestamp
  updated_at : timestamp
}

entity "campaign_reports" as reports {
  * id : bigint(20) [PK]
  --
  * campaign_id : bigint(20) [FK -> campaigns.id]
  * title : varchar(255)
  * details : text
  * amount_spent : double
  created_at : timestamp
  updated_at : timestamp
}

entity "nodes" as nodes {
  * id : bigint(20) [PK]
  --
  * name : varchar(255)
  * wallet_address : varchar(255) [UQ]
  last_seen : timestamp [nullable]
  created_at : timestamp
  updated_at : timestamp
}

users ||--o{ documents : "uploads/memiliki"
users ||--o{ campaigns : "membuat"
documents ||--o{ approvals : "diverifikasi oleh"
campaigns ||--o{ comments : "memiliki komentar"
campaigns ||--o{ reports : "memiliki laporan dana"
@endum
```

### B. Kode Mermaid ERD
```mermaid
erDiagram
    users {
        bigint id PK
        varchar name
        varchar wallet_address UK
        varchar email "nullable, UK"
        varchar password "nullable"
        varchar nonce "nullable"
        enum role "yayasan, instansi, donatur, penerima"
        varchar instansi_type "nullable"
        varchar remember_token "nullable"
        timestamp created_at
        timestamp updated_at
    }

    documents {
        bigint id PK
        bigint user_id FK "nullable"
        varchar file_name
        varchar file_path
        int file_size
        varchar mime_type
        varchar ipfs_cid
        varchar nama "nullable"
        varchar nik "nullable"
        varchar kategori "nullable"
        text keterangan "nullable"
        json details "nullable"
        varchar wallet_address "nullable"
        enum status "menunggu, disetujui, ditolak"
        varchar tahap_bantuan
        json signed_by "nullable"
        json rejected_by "nullable"
        timestamp created_at
        timestamp updated_at
    }

    document_approvals {
        bigint id PK
        bigint document_id FK
        varchar node_wallet_address
        varchar status
        timestamp created_at
        timestamp updated_at
    }

    campaigns {
        bigint id PK
        bigint user_id FK "nullable"
        varchar title
        text description
        varchar category
        double target_donation
        double collected_donation
        varchar status
        varchar image_url "nullable"
        timestamp created_at
        timestamp updated_at
    }

    campaign_comments {
        bigint id PK
        bigint campaign_id FK
        varchar user_name
        text comment
        timestamp created_at
        timestamp updated_at
    }

    campaign_reports {
        bigint id PK
        bigint campaign_id FK
        varchar title
        text details
        double amount_spent
        timestamp created_at
        timestamp updated_at
    }

    nodes {
        bigint id PK
        varchar name
        varchar wallet_address UK
        timestamp last_seen "nullable"
        timestamp created_at
        timestamp updated_at
    }

    users ||--o{ documents : "uploads"
    users ||--o{ campaigns : "creates"
    documents ||--o{ document_approvals : "has approvals"
    campaigns ||--o{ campaign_comments : "has comments"
    campaigns ||--o{ campaign_reports : "has reports"
```

---

## 💡 Cara Import ke Draw.io
1. Buka [draw.io](https://app.diagrams.net/).
2. Pada menu bar, pilih **Arrange** > **Insert** > **Advanced** > **PlantUML...** (atau **Mermaid...** jika menggunakan kode Mermaid).
3. Salin kode blok di atas, lalu tempel (paste) ke dalam kolom input yang tersedia.
4. Klik **Insert**. Diagram akan otomatis dibuat dan siap Anda rapikan/desain ulang di canvas draw.io!
