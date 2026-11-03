import { Question } from '../types';

export const initialQuestionBank: Question[][] = [
  // Aras 1: Asas Kuasa Dua Nombor Bulat Kecil (SP 3.1.4)
  [
    {
      id: 'l1_q1',
      q: 'Cari nilai bagi (6)² tanpa menggunakan kalkulator.',
      opts: ['36', '12', '18', '42'],
      a: '36',
      exp: '(6)² bermaksud 6 didarab dengan dirinya sendiri: 6 × 6 = 36.',
      sp: 'SP 3.1.4'
    },
    {
      id: 'l1_q2',
      q: 'Cari nilai bagi (9)² tanpa menggunakan alat teknologi.',
      opts: ['81', '18', '72', '27'],
      a: '81',
      exp: '(9)² = 9 × 9 = 81.',
      sp: 'SP 3.1.4'
    },
    {
      id: 'l1_q3',
      q: 'Hitung nilai bagi (-4)².',
      opts: ['16', '-16', '-8', '8'],
      a: '16',
      exp: 'Nombor negatif yang dikuasaduakan menghasilkan nombor positif: (-4) × (-4) = +16.',
      sp: 'SP 3.1.4'
    },
    {
      id: 'l1_q4',
      q: 'Hitung nilai bagi (-7)².',
      opts: ['49', '-49', '-14', '14'],
      a: '49',
      exp: '(-7) × (-7) = 49. Kuasa dua sebarang nombor nyata sentiasa positif atau sifar.',
      sp: 'SP 3.1.4'
    },
    {
      id: 'l1_q5',
      q: 'Cari nilai bagi (11)²',
      opts: ['121', '22', '110', '131'],
      a: '121',
      exp: '(11)² = 11 × 11 = 121.',
      sp: 'SP 3.1.4'
    }
  ],

  // Aras 2: Punca Kuasa Dua Nombor Bulat Sempurna (SP 3.1.5)
  [
    {
      id: 'l2_q1',
      q: 'Tentukan nilai bagi √49 tanpa menggunakan alat teknologi.',
      opts: ['7', '6', '8', '9'],
      a: '7',
      exp: 'Kerana 7 × 7 = 49, maka punca kuasa dua bagi 49 ialah 7.',
      sp: 'SP 3.1.5'
    },
    {
      id: 'l2_q2',
      q: 'Tentukan nilai bagi √81 tanpa kalkulator.',
      opts: ['9', '8', '7', '11'],
      a: '9',
      exp: '9² = 81, oleh itu nilai bagi √81 ialah 9.',
      sp: 'SP 3.1.5'
    },
    {
      id: 'l2_q3',
      q: 'Tentukan nilai bagi √144 tanpa kalkulator.',
      opts: ['12', '14', '11', '24'],
      a: '12',
      exp: '12 × 12 = 144, maka √144 = 12.',
      sp: 'SP 3.1.5'
    },
    {
      id: 'l2_q4',
      q: 'Tentukan nilai bagi √100.',
      opts: ['10', '20', '50', '5'],
      a: '10',
      exp: '10 × 10 = 100, jadi √100 = 10.',
      sp: 'SP 3.1.5'
    },
    {
      id: 'l2_q5',
      q: 'Tentukan nilai bagi √25 tanpa menggunakan teknologi.',
      opts: ['5', '10', '12.5', '1'],
      a: '5',
      exp: '5 × 5 = 25, maka √25 = 5.',
      sp: 'SP 3.1.5'
    }
  ],

  // Aras 3: Kuasa Dua Pecahan Wajar (SP 3.1.4)
  [
    {
      id: 'l3_q1',
      q: 'Hitung nilai bagi (3/5)².',
      opts: ['9/25', '6/10', '9/10', '6/25'],
      a: '9/25',
      exp: '(3/5)² = (3 × 3) / (5 × 5) = 9/25.',
      sp: 'SP 3.1.4'
    },
    {
      id: 'l3_q2',
      q: 'Hitung nilai bagi (2/7)².',
      opts: ['4/49', '4/14', '2/49', '4/7'],
      a: '4/49',
      exp: 'Kuasaduakan pengangka dan penyebut secara berasingan: 2² / 7² = 4/49.',
      sp: 'SP 3.1.4'
    },
    {
      id: 'l3_q3',
      q: 'Hitung nilai bagi (-1/4)².',
      opts: ['1/16', '-1/16', '-1/8', '1/8'],
      a: '1/16',
      exp: '(-1/4) × (-1/4) = +1/16.',
      sp: 'SP 3.1.4'
    },
    {
      id: 'l3_q4',
      q: 'Hitung nilai bagi (5/6)².',
      opts: ['25/36', '10/12', '25/12', '10/36'],
      a: '25/36',
      exp: '5² / 6² = 25/36.',
      sp: 'SP 3.1.4'
    },
    {
      id: 'l3_q5',
      q: 'Hitung nilai bagi (-4/9)².',
      opts: ['16/81', '-16/81', '-8/18', '8/81'],
      a: '16/81',
      exp: '(-4)² / 9² = 16/81.',
      sp: 'SP 3.1.4'
    }
  ],

  // Aras 4: Punca Kuasa Dua Pecahan Wajar (SP 3.1.5)
  [
    {
      id: 'l4_q1',
      q: 'Tentukan nilai bagi √(16/49) tanpa kalkulator.',
      opts: ['4/7', '8/7', '4/14', '2/7'],
      a: '4/7',
      exp: '√16 = 4 dan √49 = 7, maka √(16/49) = 4/7.',
      sp: 'SP 3.1.5'
    },
    {
      id: 'l4_q2',
      q: 'Tentukan nilai bagi √(25/64).',
      opts: ['5/8', '5/16', '10/8', '5/32'],
      a: '5/8',
      exp: '√25 = 5 dan √64 = 8, hasilnya 5/8.',
      sp: 'SP 3.1.5'
    },
    {
      id: 'l4_q3',
      q: 'Tentukan nilai bagi √(9/100).',
      opts: ['3/10', '3/50', '9/10', '1/10'],
      a: '3/10',
      exp: '√9 / √100 = 3/10.',
      sp: 'SP 3.1.5'
    },
    {
      id: 'l4_q4',
      q: 'Tentukan nilai bagi √(1/36).',
      opts: ['1/6', '1/18', '1/12', '2/6'],
      a: '1/6',
      exp: '√1 / √36 = 1/6.',
      sp: 'SP 3.1.5'
    },
    {
      id: 'l4_q5',
      q: 'Tentukan nilai bagi √(4/81).',
      opts: ['2/9', '4/9', '2/27', '1/9'],
      a: '2/9',
      exp: '√4 / √81 = 2/9.',
      sp: 'SP 3.1.5'
    }
  ],

  // Aras 5: Kuasa Dua Perpuluhan (SP 3.1.4)
  [
    {
      id: 'l5_q1',
      q: 'Hitung nilai bagi (0.3)² tanpa menggunakan kalkulator.',
      opts: ['0.09', '0.9', '0.6', '0.009'],
      a: '0.09',
      exp: '0.3 mempunyai 1 tempat perpuluhan, jadi kuasa duanya mempunyai 2 tempat perpuluhan: 3 × 3 = 9 -> 0.09.',
      sp: 'SP 3.1.4'
    },
    {
      id: 'l5_q2',
      q: 'Hitung nilai bagi (0.7)².',
      opts: ['0.49', '0.049', '4.9', '0.14'],
      a: '0.49',
      exp: '7 × 7 = 49 dengan 2 tempat perpuluhan = 0.49.',
      sp: 'SP 3.1.4'
    },
    {
      id: 'l5_q3',
      q: 'Hitung nilai bagi (-0.5)².',
      opts: ['0.25', '-0.25', '-0.1', '0.025'],
      a: '0.25',
      exp: '(-0.5) × (-0.5) = +0.25.',
      sp: 'SP 3.1.4'
    },
    {
      id: 'l5_q4',
      q: 'Hitung nilai bagi (0.12)².',
      opts: ['0.0144', '0.144', '1.44', '0.024'],
      a: '0.0144',
      exp: '12² = 144. 2 tempat perpuluhan dikuasaduakan menjadi 4 tempat perpuluhan: 0.0144.',
      sp: 'SP 3.1.4'
    },
    {
      id: 'l5_q5',
      q: 'Hitung nilai bagi (0.04)².',
      opts: ['0.0016', '0.016', '0.16', '0.00016'],
      a: '0.0016',
      exp: '4² = 16 dengan 4 tempat perpuluhan: 0.0016.',
      sp: 'SP 3.1.4'
    }
  ],

  // Aras 6: Punca Kuasa Dua Perpuluhan (SP 3.1.5)
  [
    {
      id: 'l6_q1',
      q: 'Tentukan nilai bagi √0.36 tanpa teknologi.',
      opts: ['0.6', '0.06', '0.18', '6'],
      a: '0.6',
      exp: 'Kerana 0.6 × 0.6 = 0.36, maka √0.36 = 0.6.',
      sp: 'SP 3.1.5'
    },
    {
      id: 'l6_q2',
      q: 'Tentukan nilai bagi √0.81.',
      opts: ['0.9', '0.09', '9', '0.18'],
      a: '0.9',
      exp: '0.9 × 0.9 = 0.81, jadi √0.81 = 0.9.',
      sp: 'SP 3.1.5'
    },
    {
      id: 'l6_q3',
      q: 'Tentukan nilai bagi √0.04.',
      opts: ['0.2', '0.02', '0.4', '0.002'],
      a: '0.2',
      exp: '2 tempat perpuluhan menjadi 1 tempat perpuluhan: √0.04 = 0.2.',
      sp: 'SP 3.1.5'
    },
    {
      id: 'l6_q4',
      q: 'Tentukan nilai bagi √0.01.',
      opts: ['0.1', '0.01', '0.001', '1.0'],
      a: '0.1',
      exp: '0.1 × 0.1 = 0.01, maka √0.01 = 0.1.',
      sp: 'SP 3.1.5'
    },
    {
      id: 'l6_q5',
      q: 'Tentukan nilai bagi √0.0064.',
      opts: ['0.08', '0.8', '0.008', '0.4'],
      a: '0.08',
      exp: '4 tempat perpuluhan menjadi 2 tempat perpuluhan: √0.0064 = 0.08.',
      sp: 'SP 3.1.5'
    }
  ],

  // Aras 7: Pecahan Bercampur & Penukaran (SP 3.1.4 & SP 3.1.5)
  [
    {
      id: 'l7_q1',
      q: 'Cari nilai bagi (1 ½)².',
      opts: ['9/4 (2 ¼)', '3/2', '5/4', '9/2'],
      a: '9/4 (2 ¼)',
      exp: 'Tukar ke pecahan tak wajar: 1 ½ = 3/2. Kemudian kuasaduakan: (3/2)² = 9/4 = 2 ¼.',
      sp: 'SP 3.1.4'
    },
    {
      id: 'l7_q2',
      q: 'Cari nilai bagi (2 ⅓)².',
      opts: ['49/9 (5 4/9)', '14/9', '7/9', '49/3'],
      a: '49/9 (5 4/9)',
      exp: '2 ⅓ = 7/3. (7/3)² = 49/9 = 5 4/9.',
      sp: 'SP 3.1.4'
    },
    {
      id: 'l7_q3',
      q: 'Tentukan nilai bagi √(1 7/9) tanpa kalkulator.',
      opts: ['4/3 (1 ⅓)', '3/4', '8/9', '16/9'],
      a: '4/3 (1 ⅓)',
      exp: '1 7/9 = 16/9. Maka √(16/9) = 4/3 = 1 ⅓.',
      sp: 'SP 3.1.5'
    },
    {
      id: 'l7_q4',
      q: 'Tentukan nilai bagi √(2 7/9).',
      opts: ['5/3 (1 ⅔)', '25/9', '4/3', '5/9'],
      a: '5/3 (1 ⅔)',
      exp: '2 7/9 = (2×9 + 7)/9 = 25/9. √(25/9) = 5/3 = 1 ⅔.',
      sp: 'SP 3.1.5'
    },
    {
      id: 'l7_q5',
      q: 'Tentukan nilai bagi √(3 1/16).',
      opts: ['7/4 (1 ¾)', '49/16', '5/4', '7/16'],
      a: '7/4 (1 ¾)',
      exp: '3 1/16 = 49/16. √(49/16) = 7/4 = 1 ¾.',
      sp: 'SP 3.1.5'
    }
  ],

  // Aras 8: Kaedah Pemfaktoran Perdana (SP 3.1.5)
  [
    {
      id: 'l8_q1',
      q: 'Dengan pemfaktoran perdana 196 = 2 × 2 × 7 × 7, cari √196.',
      opts: ['14', '28', '49', '16'],
      a: '14',
      exp: 'Kumpulkan sepasang faktor perdana yang sama: 2 × 7 = 14.',
      sp: 'SP 3.1.5'
    },
    {
      id: 'l8_q2',
      q: 'Diberi 324 = 2² × 3⁴. Tentukan nilai √324.',
      opts: ['18', '36', '12', '24'],
      a: '18',
      exp: '√324 = √(2² × (3²)²) = 2 × 3² = 2 × 9 = 18.',
      sp: 'SP 3.1.5'
    },
    {
      id: 'l8_q3',
      q: 'Cari punca kuasa dua bagi 225 menggunakan pemfaktoran perdana.',
      opts: ['15', '25', '35', '12'],
      a: '15',
      exp: '225 = 3 × 3 × 5 × 5 = (3 × 5)² = 15² -> √225 = 15.',
      sp: 'SP 3.1.5'
    },
    {
      id: 'l8_q4',
      q: 'Diberi 400 = (20)². Tentukan √400.',
      opts: ['20', '40', '10', '200'],
      a: '20',
      exp: 'Punca kuasa dua bagi 400 ialah 20 kerana 20² = 400.',
      sp: 'SP 3.1.5'
    },
    {
      id: 'l8_q5',
      q: 'Tentukan nilai √256 tanpa menggunakan kalkulator.',
      opts: ['16', '14', '18', '26'],
      a: '16',
      exp: '256 = 2⁸. √256 = 2⁴ = 16.',
      sp: 'SP 3.1.5'
    }
  ],

  // Aras 9: Nombor Ratusan & Ribuan (SP 3.1.4 & SP 3.1.5)
  [
    {
      id: 'l9_q1',
      q: 'Tentukan nilai bagi √900.',
      opts: ['30', '300', '45', '90'],
      a: '30',
      exp: '30 × 30 = 900.',
      sp: 'SP 3.1.5'
    },
    {
      id: 'l9_q2',
      q: 'Tentukan nilai bagi √2500.',
      opts: ['50', '25', '500', '125'],
      a: '50',
      exp: '50 × 50 = 2500.',
      sp: 'SP 3.1.5'
    },
    {
      id: 'l9_q3',
      q: 'Tentukan nilai bagi √6400.',
      opts: ['80', '800', '40', '160'],
      a: '80',
      exp: '80 × 80 = 6400.',
      sp: 'SP 3.1.5'
    },
    {
      id: 'l9_q4',
      q: 'Cari nilai bagi (30)².',
      opts: ['900', '60', '9000', '600'],
      a: '900',
      exp: '30 × 30 = 900.',
      sp: 'SP 3.1.4'
    },
    {
      id: 'l9_q5',
      q: 'Cari nilai bagi (50)².',
      opts: ['2500', '100', '250', '500'],
      a: '2500',
      exp: '50 × 50 = 2500.',
      sp: 'SP 3.1.4'
    }
  ],

  // Aras 10: Penggunaan Alat Teknologi (Kalkulator Saintifik) (SP 3.1.4)
  [
    {
      id: 'l10_q1',
      q: 'Dengan kalkulator saintifik, cari nilai (24.5)² betul kepada 2 tempat perpuluhan.',
      opts: ['600.25', '600.50', '625.00', '590.25'],
      a: '600.25',
      exp: 'Tekan [2][4][.][5] [x²] [=] -> 600.25.',
      sp: 'SP 3.1.4'
    },
    {
      id: 'l10_q2',
      q: 'Dengan alat teknologi, hitung (7.8)².',
      opts: ['60.84', '60.48', '56.84', '61.24'],
      a: '60.84',
      exp: '7.8 × 7.8 = 60.84.',
      sp: 'SP 3.1.4'
    },
    {
      id: 'l10_q3',
      q: 'Hitung nilai bagi (13.2)² menggunakan kalkulator.',
      opts: ['174.24', '174.42', '169.24', '176.24'],
      a: '174.24',
      exp: '13.2 × 13.2 = 174.24.',
      sp: 'SP 3.1.4'
    },
    {
      id: 'l10_q4',
      q: 'Gunakan kalkulator untuk mencari nilai (3/8)² dalam perpuluhan (4 tempat perpuluhan).',
      opts: ['0.1406', '0.3750', '0.2812', '0.1500'],
      a: '0.1406',
      exp: '3/8 = 0.375. (0.375)² ≈ 0.1406.',
      sp: 'SP 3.1.4'
    },
    {
      id: 'l10_q5',
      q: 'Hitung (105)² menggunakan kalkulator.',
      opts: ['11025', '10025', '11250', '10250'],
      a: '11025',
      exp: '105 × 105 = 11025.',
      sp: 'SP 3.1.4'
    }
  ],

  // Aras 11: Operasi Bergabung Kuasa Dua & Punca Kuasa Dua (SP 3.1.5)
  [
    {
      id: 'l11_q1',
      q: 'Selesaikan: (3)² + √16.',
      opts: ['13', '10', '11', '25'],
      a: '13',
      exp: '(3)² = 9, √16 = 4. 9 + 4 = 13.',
      sp: 'SP 3.1.5'
    },
    {
      id: 'l11_q2',
      q: 'Selesaikan: √100 - (2)².',
      opts: ['6', '8', '96', '4'],
      a: '6',
      exp: '√100 = 10, (2)² = 4. 10 - 4 = 6.',
      sp: 'SP 3.1.5'
    },
    {
      id: 'l11_q3',
      q: 'Selesaikan: (√64) × (2)².',
      opts: ['32', '16', '64', '24'],
      a: '32',
      exp: '8 × 4 = 32.',
      sp: 'SP 3.1.5'
    },
    {
      id: 'l11_q4',
      q: 'Selesaikan: √49 + √81.',
      opts: ['16', '130', '14', '18'],
      a: '16',
      exp: '7 + 9 = 16.',
      sp: 'SP 3.1.5'
    },
    {
      id: 'l11_q5',
      q: 'Selesaikan: (5)² - √36.',
      opts: ['19', '14', '21', '20'],
      a: '19',
      exp: '25 - 6 = 19.',
      sp: 'SP 3.1.5'
    }
  ],

  // Aras 12: Nilai Negatif & Kurungan Kuasa Dua (SP 3.1.4)
  [
    {
      id: 'l12_q1',
      q: 'Bezakan: Apakah nilai bagi -5² berbanding (-5)²?',
      opts: ['-25 dan 25', '25 dan 25', '-25 dan -25', '25 dan -25'],
      a: '-25 dan 25',
      exp: '-5² = -(5 × 5) = -25, manakala (-5)² = (-5) × (-5) = 25.',
      sp: 'SP 3.1.4'
    },
    {
      id: 'l12_q2',
      q: 'Cari nilai bagi -(4)².',
      opts: ['-16', '16', '-8', '8'],
      a: '-16',
      exp: 'Tanda negatif berada di luar kuasa: -(4 × 4) = -16.',
      sp: 'SP 3.1.4'
    },
    {
      id: 'l12_q3',
      q: 'Cari nilai bagi (-0.1)².',
      opts: ['0.01', '-0.01', '0.1', '-0.1'],
      a: '0.01',
      exp: '(-0.1) × (-0.1) = +0.01.',
      sp: 'SP 3.1.4'
    },
    {
      id: 'l12_q4',
      q: 'Selesaikan: (-3)² + (-2)².',
      opts: ['13', '-13', '10', '-5'],
      a: '13',
      exp: '9 + 4 = 13.',
      sp: 'SP 3.1.4'
    },
    {
      id: 'l12_q5',
      q: 'Selesaikan: √144 + (-4)².',
      opts: ['28', '-4', '20', '24'],
      a: '28',
      exp: '12 + 16 = 28.',
      sp: 'SP 3.1.5'
    }
  ],

  // Aras 13: Masalah Aplikasi / Kontekstual SPM (SP 3.1.4 & SP 3.1.5)
  [
    {
      id: 'l13_q1',
      q: 'Sebuah lantai segi empat sama mempunyai luas 64 m². Berapakah panjang sisinya?',
      opts: ['8 m', '16 m', '32 m', '4 m'],
      a: '8 m',
      exp: 'Panjang sisi = √Luas = √64 = 8 m.',
      sp: 'SP 3.1.5'
    },
    {
      id: 'l13_q2',
      q: 'Luas sebidang tanah segi empat sama ialah 196 m². Cari perimeter tanah tersebut.',
      opts: ['56 m', '14 m', '28 m', '49 m'],
      a: '56 m',
      exp: 'Sisi = √196 = 14 m. Perimeter = 14 × 4 = 56 m.',
      sp: 'SP 3.1.5'
    },
    {
      id: 'l13_q3',
      q: 'Sebuah kadbod berbentuk segi empat sama mempunyai panjang sisi 1.2 m. Cari luasnya.',
      opts: ['1.44 m²', '2.4 m²', '1.24 m²', '14.4 m²'],
      a: '1.44 m²',
      exp: 'Luas = 1.2 × 1.2 = 1.44 m².',
      sp: 'SP 3.1.4'
    },
    {
      id: 'l13_q4',
      q: 'Panjang sisi jubin ialah 15 cm. Berapakah jumlah luas jubin tersebut?',
      opts: ['225 cm²', '60 cm²', '30 cm²', '150 cm²'],
      a: '225 cm²',
      exp: '15² = 225 cm².',
      sp: 'SP 3.1.4'
    },
    {
      id: 'l13_q5',
      q: 'Luas sebuah taman segi empat sama ialah 400 m². Berapakah perimeter taman itu?',
      opts: ['80 m', '20 m', '100 m', '40 m'],
      a: '80 m',
      exp: 'Sisi = √400 = 20 m. Perimeter = 20 × 4 = 80 m.',
      sp: 'SP 3.1.5'
    }
  ],

  // Aras 14: Anggaran Punca Kuasa Dua (KBAT) (SP 3.1.5)
  [
    {
      id: 'l14_q1',
      q: 'Anggarkan nilai bagi √30 tanpa kalkulator (terletak antara dua integer).',
      opts: ['Antara 5 dan 6', 'Antara 4 dan 5', 'Antara 6 dan 7', 'Antara 3 dan 4'],
      a: 'Antara 5 dan 6',
      exp: 'Kerana 5² = 25 dan 6² = 36, maka √30 berada antara 5 dan 6.',
      sp: 'SP 3.1.5'
    },
    {
      id: 'l14_q2',
      q: 'Nilai bagi √78 paling hampir dengan integer...',
      opts: ['9', '8', '7', '10'],
      a: '9',
      exp: '9² = 81 (paling dekat dengan 78 berbanding 8² = 64).',
      sp: 'SP 3.1.5'
    },
    {
      id: 'l14_q3',
      q: 'Nilai bagi √15 paling hampir dengan integer...',
      opts: ['4', '3', '5', '2'],
      a: '4',
      exp: '4² = 16, beza hanya 1 dengan 15.',
      sp: 'SP 3.1.5'
    },
    {
      id: 'l14_q4',
      q: 'Diberi 11² = 121 dan 12² = 144. Maka √130 terletak antara integer...',
      opts: ['11 dan 12', '10 dan 11', '12 dan 13', '13 dan 14'],
      a: '11 dan 12',
      exp: '121 < 130 < 144, maka nilainya antara 11 dan 12.',
      sp: 'SP 3.1.5'
    },
    {
      id: 'l14_q5',
      q: 'Nilai bagi √50 terletak paling hampir dengan nombor...',
      opts: ['7.1', '6.2', '8.0', '5.5'],
      a: '7.1',
      exp: '7² = 49, maka √50 sedikit lebih besar daripada 7 (iaitu ~7.07 atau 7.1).',
      sp: 'SP 3.1.5'
    }
  ],

  // Aras 15: Cabaran Puncak SPM & Gabungan Kuasa Tiga (Bab 3 KSSM)
  [
    {
      id: 'l15_q1',
      q: 'Hitung: √(9/25) + (0.2)².',
      opts: ['0.64', '0.62', '0.74', '0.40'],
      a: '0.64',
      exp: '√(9/25) = 3/5 = 0.6. (0.2)² = 0.04. 0.6 + 0.04 = 0.64.',
      sp: 'SP 3.1.5'
    },
    {
      id: 'l15_q2',
      q: 'Selesaikan: (2/3)² × √81.',
      opts: ['4', '6', '9', '2'],
      a: '4',
      exp: '(4/9) × 9 = 4.',
      sp: 'SP 3.1.5'
    },
    {
      id: 'l15_q3',
      q: 'Diberi √(x) = 13. Apakah nilai x?',
      opts: ['169', '26', '130', '1.3'],
      a: '169',
      exp: 'x = 13² = 169.',
      sp: 'SP 3.1.5'
    },
    {
      id: 'l15_q4',
      q: 'Diberi y² = 0.0049. Apakah nilai positif bagi y?',
      opts: ['0.07', '0.7', '0.007', '0.0007'],
      a: '0.07',
      exp: '√0.0049 = 0.07.',
      sp: 'SP 3.1.4'
    },
    {
      id: 'l15_q5',
      q: 'Selesaikan: √625 - √225 + (3)³.',
      opts: ['37', '19', '25', '41'],
      a: '37',
      exp: '√625 = 25, √225 = 15, (3)³ = 27. 25 - 15 + 27 = 37.',
      sp: 'Bab 3 KSSM'
    }
  ]
];
