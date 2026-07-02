<?php

namespace App\Enums;

enum UserRole: string
{
    case YAYASAN = 'yayasan';
    case INSTANSI = 'instansi';
    case DONATUR = 'donatur';
    case PENERIMA = 'penerima';
}
