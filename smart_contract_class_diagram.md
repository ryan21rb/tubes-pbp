# 🛡️ UML Class Diagram - Smart Contract & ZK-SNARK Components
**PhilanthropyChain dApp**

Dokumen ini berisi rancangan **UML Class Diagram** murni yang merepresentasikan relasi kelas, interface, *struct*, *event*, atribut, dan metode dari seluruh komponen Smart Contract (`PovertyCheck` & `verifier.sol`), sirkuit Circom (`verifikasi_bantuan.circom`), serta React Context (`PhilanthropyContext.jsx`).

Anda dapat langsung menyalin kode teks di bawah ini ke **draw.io** via menu **Arrange > Insert > Advanced > PlantUML** (atau **Mermaid**).

---

## 1. Kode PlantUML (Disarankan untuk draw.io)
Salin kode berikut ke draw.io melalui **Arrange > Insert > Advanced > PlantUML...**

```plantuml
@startuml
!theme plain
skinparam classAttributeIconSize 0
skinparam linetype ortho

class VerifikasiInstansi <<CircomTemplate>> {
    + nik_rahasia : private signal
    + signature_instansi : private signal
    + public_doc_hash : public signal
    + isValid : output signal
    --
    + constraints() : signature_instansi * nik_rahasia == public_doc_hash
    + enforce() : isValid == 1
}

class ZkProof <<struct>> {
    + a : uint256[2]
    + b : uint256[2][2]
    + c : uint256[2]
}

interface IZKVerifier <<interface>> {
    + verifyProof(a: uint256[2], b: uint256[2][2], c: uint256[2], input: uint256[1]) : bool
}

class Groth16Verifier <<SmartContract>> {
    + verifyProof(_pA: uint256[2], _pB: uint256[2][2], _pC: uint256[2], _pubSignals: uint256[3]) : bool
}

class VerifyingKey <<struct>> {
    + alpha1 : uint256[2]
    + beta2 : uint256[2][2]
    + gamma2 : uint256[2]
    + delta2 : uint256[2]
    + ic : uint256[2][]
}

class PovertyCheck <<SmartContract>> {
    + admin : address
    + zkVerifierAddress : address
    --
    <<event>>
    + StatusVerified(user : address, isValid : bool)
    --
    + updateVerifier(_newVerifier : address) : void
    + verifyPovertyStatus(a : uint256[2], b : uint256[2][2], c : uint256[2], input : uint256[1]) : bool
}

class PhilanthropyContext <<ReactContext>> {
    + walletAddress : string
    + apiToken : string
    --
    + ajukanBantuan(formData : object, fileMap : object) : Promise
    + voteDocument(id : number, walletAddress : string, status : string) : Promise
}

' Relasi Antar Kelas
VerifikasiInstansi ..> ZkProof : "Dibuat menjadi bukti oleh SnarkJS"
PhilanthropyContext ..> ZkProof : "Menghasilkan & mengirimkan"
PhilanthropyContext ..> PovertyCheck : "Memanggil verifyPovertyStatus"
PovertyCheck ..> IZKVerifier : "Memanggil verifyProof"
Groth16Verifier ..|> IZKVerifier : "Mengimplementasikan"
Groth16Verifier *-- VerifyingKey : "Menggunakan"
@endum
```

---

## 2. Kode Mermaid Class Diagram
Salin kode berikut ke draw.io melalui **Arrange > Insert > Advanced > Mermaid...**

```mermaid
classDiagram
    class VerifikasiInstansi {
        <<CircomTemplate>>
        +private_signal nik_rahasia
        +private_signal signature_instansi
        +public_signal public_doc_hash
        +output_signal isValid
        +constraints()
        +enforce()
    }

    class ZkProof {
        <<struct>>
        +uint256[2] a
        +uint256[2][2] b
        +uint256[2] c
    }

    class IZKVerifier {
        <<interface>>
        +verifyProof(uint256[2] a, uint256[2][2] b, uint256[2] c, uint256[1] input) bool
    }

    class Groth16Verifier {
        <<SmartContract>>
        +verifyProof(uint256[2] _pA, uint256[2][2] _pB, uint256[2] _pC, uint256[3] _pubSignals) bool
    }

    class VerifyingKey {
        <<struct>>
        +uint256[2] alpha1
        +uint256[2][2] beta2
        +uint256[2] gamma2
        +uint256[2] delta2
        +uint256[2][] ic
    }

    class PovertyCheck {
        <<SmartContract>>
        +address admin
        +address zkVerifierAddress
        +StatusVerified(address user, bool isValid) event
        +updateVerifier(address _newVerifier)
        +verifyPovertyStatus(uint256[2] a, uint256[2][2] b, uint256[2] c, uint256[1] input) bool
    }

    class PhilanthropyContext {
        <<ReactContext>>
        +string walletAddress
        +string apiToken
        +ajukanBantuan(object formData, object fileMap)
        +voteDocument(number id, string walletAddress, string status)
    }

    VerifikasiInstansi ..> ZkProof : Dibuat bukti (SnarkJS)
    PhilanthropyContext ..> ZkProof : Menghasilkan & mengirim
    PhilanthropyContext ..> PovertyCheck : Memanggil verifyPovertyStatus
    PovertyCheck ..> IZKVerifier : Memanggil verifyProof
    Groth16Verifier ..|> IZKVerifier : Mengimplementasikan
    Groth16Verifier *-- VerifyingKey : Menggunakan
```

---

## 🔍 Penjelasan Relasi:
*   **`VerifikasiInstansi` ke `ZkProof` (Dependency)**: Sirkuit Circom menetapkan kendala yang digunakan SnarkJS untuk menghasilkan `ZkProof`.
*   **`PhilanthropyContext` ke `ZkProof` (Dependency)**: Frontend menghitung bukti dan mengirimkan struktur data bukti ini ke smart contract.
*   **`PhilanthropyContext` ke `PovertyCheck` (Dependency)**: Frontend memanggil fungsi `verifyPovertyStatus` dengan parameter bukti ZKP.
*   **`PovertyCheck` ke `IZKVerifier` (Dependency)**: Kontrak utama memanggil fungsi interface `verifyProof` untuk melakukan pencocokan bukti ZKP.
*   **`Groth16Verifier` ke `IZKVerifier` (Realization)**: Kontrak verifikator yang dihasilkan SnarkJS mengimplementasikan interface verifikasi ZKP.
*   **`Groth16Verifier` ke `VerifyingKey` (Association/Composition)**: Verifikator menggunakan data kunci verifikasi yang berisi titik-titik kurva eliptik Alpha, Beta, Gamma, dan Delta.
