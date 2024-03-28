type Variants = Record<
  string,
  {
    weights: string;
    subsets: string;
  }
>;

export type FontInfo = {
  fontFamily: string;
  importName: string;
  version: string;
  url: string;
  unicodeRanges: Record<string, string>;
  fonts: Record<string, Record<string, Record<string, string>>>;
};

export type GoogleFont = {
  getInfo: () => FontInfo;
  fontFamily: string;
  loadFont: <T extends keyof Variants>(
    style?: T | undefined,
    options?:
      | {
          weights?: Variants[T]['weights'][] | undefined;
          subsets?: Variants[T]['subsets'][] | undefined;
          document?: Document | undefined;
        }
      | undefined,
  ) => {
    fontFamily: string;
    fonts: Record<string, Record<string, Record<string, string>>>;
    unicodeRanges: Record<string, string>;
  };
};

export const getAvailableFonts = () => [
  {
    fontFamily: 'ABeeZee',
    importName: 'ABeeZee',
    load: () => import('./ABeeZee') as Promise<FontInfo>,
  },
  {
    fontFamily: 'ADLaM Display',
    importName: 'ADLaMDisplay',
    load: () => import('./ADLaMDisplay') as Promise<FontInfo>,
  },
  {
    fontFamily: 'AR One Sans',
    importName: 'AROneSans',
    load: () => import('./AROneSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Abel',
    importName: 'Abel',
    load: () => import('./Abel') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Abhaya Libre',
    importName: 'AbhayaLibre',
    load: () => import('./AbhayaLibre') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Aboreto',
    importName: 'Aboreto',
    load: () => import('./Aboreto') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Abril Fatface',
    importName: 'AbrilFatface',
    load: () => import('./AbrilFatface') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Abyssinica SIL',
    importName: 'AbyssinicaSIL',
    load: () => import('./AbyssinicaSIL') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Aclonica',
    importName: 'Aclonica',
    load: () => import('./Aclonica') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Acme',
    importName: 'Acme',
    load: () => import('./Acme') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Actor',
    importName: 'Actor',
    load: () => import('./Actor') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Adamina',
    importName: 'Adamina',
    load: () => import('./Adamina') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Advent Pro',
    importName: 'AdventPro',
    load: () => import('./AdventPro') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Agbalumo',
    importName: 'Agbalumo',
    load: () => import('./Agbalumo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Agdasima',
    importName: 'Agdasima',
    load: () => import('./Agdasima') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Aguafina Script',
    importName: 'AguafinaScript',
    load: () => import('./AguafinaScript') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Akatab',
    importName: 'Akatab',
    load: () => import('./Akatab') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Akaya Kanadaka',
    importName: 'AkayaKanadaka',
    load: () => import('./AkayaKanadaka') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Akaya Telivigala',
    importName: 'AkayaTelivigala',
    load: () => import('./AkayaTelivigala') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Akronim',
    importName: 'Akronim',
    load: () => import('./Akronim') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Akshar',
    importName: 'Akshar',
    load: () => import('./Akshar') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Aladin',
    importName: 'Aladin',
    load: () => import('./Aladin') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Alata',
    importName: 'Alata',
    load: () => import('./Alata') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Alatsi',
    importName: 'Alatsi',
    load: () => import('./Alatsi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Albert Sans',
    importName: 'AlbertSans',
    load: () => import('./AlbertSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Aldrich',
    importName: 'Aldrich',
    load: () => import('./Aldrich') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Alef',
    importName: 'Alef',
    load: () => import('./Alef') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Alegreya',
    importName: 'Alegreya',
    load: () => import('./Alegreya') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Alegreya SC',
    importName: 'AlegreyaSC',
    load: () => import('./AlegreyaSC') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Alegreya Sans',
    importName: 'AlegreyaSans',
    load: () => import('./AlegreyaSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Alegreya Sans SC',
    importName: 'AlegreyaSansSC',
    load: () => import('./AlegreyaSansSC') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Aleo',
    importName: 'Aleo',
    load: () => import('./Aleo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Alex Brush',
    importName: 'AlexBrush',
    load: () => import('./AlexBrush') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Alexandria',
    importName: 'Alexandria',
    load: () => import('./Alexandria') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Alfa Slab One',
    importName: 'AlfaSlabOne',
    load: () => import('./AlfaSlabOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Alice',
    importName: 'Alice',
    load: () => import('./Alice') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Alike',
    importName: 'Alike',
    load: () => import('./Alike') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Alike Angular',
    importName: 'AlikeAngular',
    load: () => import('./AlikeAngular') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Alkalami',
    importName: 'Alkalami',
    load: () => import('./Alkalami') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Alkatra',
    importName: 'Alkatra',
    load: () => import('./Alkatra') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Allan',
    importName: 'Allan',
    load: () => import('./Allan') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Allerta',
    importName: 'Allerta',
    load: () => import('./Allerta') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Allerta Stencil',
    importName: 'AllertaStencil',
    load: () => import('./AllertaStencil') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Allison',
    importName: 'Allison',
    load: () => import('./Allison') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Allura',
    importName: 'Allura',
    load: () => import('./Allura') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Almarai',
    importName: 'Almarai',
    load: () => import('./Almarai') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Almendra',
    importName: 'Almendra',
    load: () => import('./Almendra') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Almendra Display',
    importName: 'AlmendraDisplay',
    load: () => import('./AlmendraDisplay') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Almendra SC',
    importName: 'AlmendraSC',
    load: () => import('./AlmendraSC') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Alumni Sans',
    importName: 'AlumniSans',
    load: () => import('./AlumniSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Alumni Sans Collegiate One',
    importName: 'AlumniSansCollegiateOne',
    load: () => import('./AlumniSansCollegiateOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Alumni Sans Inline One',
    importName: 'AlumniSansInlineOne',
    load: () => import('./AlumniSansInlineOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Alumni Sans Pinstripe',
    importName: 'AlumniSansPinstripe',
    load: () => import('./AlumniSansPinstripe') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Amarante',
    importName: 'Amarante',
    load: () => import('./Amarante') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Amaranth',
    importName: 'Amaranth',
    load: () => import('./Amaranth') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Amatic SC',
    importName: 'AmaticSC',
    load: () => import('./AmaticSC') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Amethysta',
    importName: 'Amethysta',
    load: () => import('./Amethysta') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Amiko',
    importName: 'Amiko',
    load: () => import('./Amiko') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Amiri',
    importName: 'Amiri',
    load: () => import('./Amiri') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Amiri Quran',
    importName: 'AmiriQuran',
    load: () => import('./AmiriQuran') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Amita',
    importName: 'Amita',
    load: () => import('./Amita') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Anaheim',
    importName: 'Anaheim',
    load: () => import('./Anaheim') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Andada Pro',
    importName: 'AndadaPro',
    load: () => import('./AndadaPro') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Andika',
    importName: 'Andika',
    load: () => import('./Andika') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Anek Bangla',
    importName: 'AnekBangla',
    load: () => import('./AnekBangla') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Anek Devanagari',
    importName: 'AnekDevanagari',
    load: () => import('./AnekDevanagari') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Anek Gujarati',
    importName: 'AnekGujarati',
    load: () => import('./AnekGujarati') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Anek Gurmukhi',
    importName: 'AnekGurmukhi',
    load: () => import('./AnekGurmukhi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Anek Kannada',
    importName: 'AnekKannada',
    load: () => import('./AnekKannada') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Anek Latin',
    importName: 'AnekLatin',
    load: () => import('./AnekLatin') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Anek Malayalam',
    importName: 'AnekMalayalam',
    load: () => import('./AnekMalayalam') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Anek Odia',
    importName: 'AnekOdia',
    load: () => import('./AnekOdia') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Anek Tamil',
    importName: 'AnekTamil',
    load: () => import('./AnekTamil') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Anek Telugu',
    importName: 'AnekTelugu',
    load: () => import('./AnekTelugu') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Angkor',
    importName: 'Angkor',
    load: () => import('./Angkor') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Annie Use Your Telescope',
    importName: 'AnnieUseYourTelescope',
    load: () => import('./AnnieUseYourTelescope') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Anonymous Pro',
    importName: 'AnonymousPro',
    load: () => import('./AnonymousPro') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Antic',
    importName: 'Antic',
    load: () => import('./Antic') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Antic Didone',
    importName: 'AnticDidone',
    load: () => import('./AnticDidone') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Antic Slab',
    importName: 'AnticSlab',
    load: () => import('./AnticSlab') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Anton',
    importName: 'Anton',
    load: () => import('./Anton') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Antonio',
    importName: 'Antonio',
    load: () => import('./Antonio') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Anuphan',
    importName: 'Anuphan',
    load: () => import('./Anuphan') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Anybody',
    importName: 'Anybody',
    load: () => import('./Anybody') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Aoboshi One',
    importName: 'AoboshiOne',
    load: () => import('./AoboshiOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Arapey',
    importName: 'Arapey',
    load: () => import('./Arapey') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Arbutus',
    importName: 'Arbutus',
    load: () => import('./Arbutus') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Arbutus Slab',
    importName: 'ArbutusSlab',
    load: () => import('./ArbutusSlab') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Architects Daughter',
    importName: 'ArchitectsDaughter',
    load: () => import('./ArchitectsDaughter') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Archivo',
    importName: 'Archivo',
    load: () => import('./Archivo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Archivo Black',
    importName: 'ArchivoBlack',
    load: () => import('./ArchivoBlack') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Archivo Narrow',
    importName: 'ArchivoNarrow',
    load: () => import('./ArchivoNarrow') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Are You Serious',
    importName: 'AreYouSerious',
    load: () => import('./AreYouSerious') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Aref Ruqaa',
    importName: 'ArefRuqaa',
    load: () => import('./ArefRuqaa') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Aref Ruqaa Ink',
    importName: 'ArefRuqaaInk',
    load: () => import('./ArefRuqaaInk') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Arima',
    importName: 'Arima',
    load: () => import('./Arima') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Arimo',
    importName: 'Arimo',
    load: () => import('./Arimo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Arizonia',
    importName: 'Arizonia',
    load: () => import('./Arizonia') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Armata',
    importName: 'Armata',
    load: () => import('./Armata') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Arsenal',
    importName: 'Arsenal',
    load: () => import('./Arsenal') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Artifika',
    importName: 'Artifika',
    load: () => import('./Artifika') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Arvo',
    importName: 'Arvo',
    load: () => import('./Arvo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Arya',
    importName: 'Arya',
    load: () => import('./Arya') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Asap',
    importName: 'Asap',
    load: () => import('./Asap') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Asap Condensed',
    importName: 'AsapCondensed',
    load: () => import('./AsapCondensed') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Asar',
    importName: 'Asar',
    load: () => import('./Asar') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Asset',
    importName: 'Asset',
    load: () => import('./Asset') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Assistant',
    importName: 'Assistant',
    load: () => import('./Assistant') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Astloch',
    importName: 'Astloch',
    load: () => import('./Astloch') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Asul',
    importName: 'Asul',
    load: () => import('./Asul') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Athiti',
    importName: 'Athiti',
    load: () => import('./Athiti') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Atkinson Hyperlegible',
    importName: 'AtkinsonHyperlegible',
    load: () => import('./AtkinsonHyperlegible') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Atma',
    importName: 'Atma',
    load: () => import('./Atma') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Atomic Age',
    importName: 'AtomicAge',
    load: () => import('./AtomicAge') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Aubrey',
    importName: 'Aubrey',
    load: () => import('./Aubrey') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Audiowide',
    importName: 'Audiowide',
    load: () => import('./Audiowide') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Autour One',
    importName: 'AutourOne',
    load: () => import('./AutourOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Average',
    importName: 'Average',
    load: () => import('./Average') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Average Sans',
    importName: 'AverageSans',
    load: () => import('./AverageSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Averia Gruesa Libre',
    importName: 'AveriaGruesaLibre',
    load: () => import('./AveriaGruesaLibre') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Averia Libre',
    importName: 'AveriaLibre',
    load: () => import('./AveriaLibre') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Averia Sans Libre',
    importName: 'AveriaSansLibre',
    load: () => import('./AveriaSansLibre') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Averia Serif Libre',
    importName: 'AveriaSerifLibre',
    load: () => import('./AveriaSerifLibre') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Azeret Mono',
    importName: 'AzeretMono',
    load: () => import('./AzeretMono') as Promise<FontInfo>,
  },
  {
    fontFamily: 'B612',
    importName: 'B612',
    load: () => import('./B612') as Promise<FontInfo>,
  },
  {
    fontFamily: 'B612 Mono',
    importName: 'B612Mono',
    load: () => import('./B612Mono') as Promise<FontInfo>,
  },
  {
    fontFamily: 'BIZ UDGothic',
    importName: 'BIZUDGothic',
    load: () => import('./BIZUDGothic') as Promise<FontInfo>,
  },
  {
    fontFamily: 'BIZ UDMincho',
    importName: 'BIZUDMincho',
    load: () => import('./BIZUDMincho') as Promise<FontInfo>,
  },
  {
    fontFamily: 'BIZ UDPGothic',
    importName: 'BIZUDPGothic',
    load: () => import('./BIZUDPGothic') as Promise<FontInfo>,
  },
  {
    fontFamily: 'BIZ UDPMincho',
    importName: 'BIZUDPMincho',
    load: () => import('./BIZUDPMincho') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Babylonica',
    importName: 'Babylonica',
    load: () => import('./Babylonica') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bacasime Antique',
    importName: 'BacasimeAntique',
    load: () => import('./BacasimeAntique') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bad Script',
    importName: 'BadScript',
    load: () => import('./BadScript') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bagel Fat One',
    importName: 'BagelFatOne',
    load: () => import('./BagelFatOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bahiana',
    importName: 'Bahiana',
    load: () => import('./Bahiana') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bahianita',
    importName: 'Bahianita',
    load: () => import('./Bahianita') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bai Jamjuree',
    importName: 'BaiJamjuree',
    load: () => import('./BaiJamjuree') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bakbak One',
    importName: 'BakbakOne',
    load: () => import('./BakbakOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Ballet',
    importName: 'Ballet',
    load: () => import('./Ballet') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Baloo 2',
    importName: 'Baloo2',
    load: () => import('./Baloo2') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Baloo Bhai 2',
    importName: 'BalooBhai2',
    load: () => import('./BalooBhai2') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Baloo Bhaijaan 2',
    importName: 'BalooBhaijaan2',
    load: () => import('./BalooBhaijaan2') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Baloo Bhaina 2',
    importName: 'BalooBhaina2',
    load: () => import('./BalooBhaina2') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Baloo Chettan 2',
    importName: 'BalooChettan2',
    load: () => import('./BalooChettan2') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Baloo Da 2',
    importName: 'BalooDa2',
    load: () => import('./BalooDa2') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Baloo Paaji 2',
    importName: 'BalooPaaji2',
    load: () => import('./BalooPaaji2') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Baloo Tamma 2',
    importName: 'BalooTamma2',
    load: () => import('./BalooTamma2') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Baloo Tammudu 2',
    importName: 'BalooTammudu2',
    load: () => import('./BalooTammudu2') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Baloo Thambi 2',
    importName: 'BalooThambi2',
    load: () => import('./BalooThambi2') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Balsamiq Sans',
    importName: 'BalsamiqSans',
    load: () => import('./BalsamiqSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Balthazar',
    importName: 'Balthazar',
    load: () => import('./Balthazar') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bangers',
    importName: 'Bangers',
    load: () => import('./Bangers') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Barlow',
    importName: 'Barlow',
    load: () => import('./Barlow') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Barlow Condensed',
    importName: 'BarlowCondensed',
    load: () => import('./BarlowCondensed') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Barlow Semi Condensed',
    importName: 'BarlowSemiCondensed',
    load: () => import('./BarlowSemiCondensed') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Barriecito',
    importName: 'Barriecito',
    load: () => import('./Barriecito') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Barrio',
    importName: 'Barrio',
    load: () => import('./Barrio') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Basic',
    importName: 'Basic',
    load: () => import('./Basic') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Baskervville',
    importName: 'Baskervville',
    load: () => import('./Baskervville') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Battambang',
    importName: 'Battambang',
    load: () => import('./Battambang') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Baumans',
    importName: 'Baumans',
    load: () => import('./Baumans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bayon',
    importName: 'Bayon',
    load: () => import('./Bayon') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Be Vietnam Pro',
    importName: 'BeVietnamPro',
    load: () => import('./BeVietnamPro') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Beau Rivage',
    importName: 'BeauRivage',
    load: () => import('./BeauRivage') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bebas Neue',
    importName: 'BebasNeue',
    load: () => import('./BebasNeue') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Belanosima',
    importName: 'Belanosima',
    load: () => import('./Belanosima') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Belgrano',
    importName: 'Belgrano',
    load: () => import('./Belgrano') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bellefair',
    importName: 'Bellefair',
    load: () => import('./Bellefair') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Belleza',
    importName: 'Belleza',
    load: () => import('./Belleza') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bellota',
    importName: 'Bellota',
    load: () => import('./Bellota') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bellota Text',
    importName: 'BellotaText',
    load: () => import('./BellotaText') as Promise<FontInfo>,
  },
  {
    fontFamily: 'BenchNine',
    importName: 'BenchNine',
    load: () => import('./BenchNine') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Benne',
    importName: 'Benne',
    load: () => import('./Benne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bentham',
    importName: 'Bentham',
    load: () => import('./Bentham') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Berkshire Swash',
    importName: 'BerkshireSwash',
    load: () => import('./BerkshireSwash') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Besley',
    importName: 'Besley',
    load: () => import('./Besley') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Beth Ellen',
    importName: 'BethEllen',
    load: () => import('./BethEllen') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bevan',
    importName: 'Bevan',
    load: () => import('./Bevan') as Promise<FontInfo>,
  },
  {
    fontFamily: 'BhuTuka Expanded One',
    importName: 'BhuTukaExpandedOne',
    load: () => import('./BhuTukaExpandedOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Big Shoulders Display',
    importName: 'BigShouldersDisplay',
    load: () => import('./BigShouldersDisplay') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Big Shoulders Inline Display',
    importName: 'BigShouldersInlineDisplay',
    load: () => import('./BigShouldersInlineDisplay') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Big Shoulders Inline Text',
    importName: 'BigShouldersInlineText',
    load: () => import('./BigShouldersInlineText') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Big Shoulders Stencil Display',
    importName: 'BigShouldersStencilDisplay',
    load: () => import('./BigShouldersStencilDisplay') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Big Shoulders Stencil Text',
    importName: 'BigShouldersStencilText',
    load: () => import('./BigShouldersStencilText') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Big Shoulders Text',
    importName: 'BigShouldersText',
    load: () => import('./BigShouldersText') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bigelow Rules',
    importName: 'BigelowRules',
    load: () => import('./BigelowRules') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bigshot One',
    importName: 'BigshotOne',
    load: () => import('./BigshotOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bilbo',
    importName: 'Bilbo',
    load: () => import('./Bilbo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bilbo Swash Caps',
    importName: 'BilboSwashCaps',
    load: () => import('./BilboSwashCaps') as Promise<FontInfo>,
  },
  {
    fontFamily: 'BioRhyme',
    importName: 'BioRhyme',
    load: () => import('./BioRhyme') as Promise<FontInfo>,
  },
  {
    fontFamily: 'BioRhyme Expanded',
    importName: 'BioRhymeExpanded',
    load: () => import('./BioRhymeExpanded') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Birthstone',
    importName: 'Birthstone',
    load: () => import('./Birthstone') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Birthstone Bounce',
    importName: 'BirthstoneBounce',
    load: () => import('./BirthstoneBounce') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Biryani',
    importName: 'Biryani',
    load: () => import('./Biryani') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bitter',
    importName: 'Bitter',
    load: () => import('./Bitter') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Black And White Picture',
    importName: 'BlackAndWhitePicture',
    load: () => import('./BlackAndWhitePicture') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Black Han Sans',
    importName: 'BlackHanSans',
    load: () => import('./BlackHanSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Black Ops One',
    importName: 'BlackOpsOne',
    load: () => import('./BlackOpsOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Blaka',
    importName: 'Blaka',
    load: () => import('./Blaka') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Blaka Hollow',
    importName: 'BlakaHollow',
    load: () => import('./BlakaHollow') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Blaka Ink',
    importName: 'BlakaInk',
    load: () => import('./BlakaInk') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Blinker',
    importName: 'Blinker',
    load: () => import('./Blinker') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bodoni Moda',
    importName: 'BodoniModa',
    load: () => import('./BodoniModa') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bokor',
    importName: 'Bokor',
    load: () => import('./Bokor') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bona Nova',
    importName: 'BonaNova',
    load: () => import('./BonaNova') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bonbon',
    importName: 'Bonbon',
    load: () => import('./Bonbon') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bonheur Royale',
    importName: 'BonheurRoyale',
    load: () => import('./BonheurRoyale') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Boogaloo',
    importName: 'Boogaloo',
    load: () => import('./Boogaloo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Borel',
    importName: 'Borel',
    load: () => import('./Borel') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bowlby One',
    importName: 'BowlbyOne',
    load: () => import('./BowlbyOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bowlby One SC',
    importName: 'BowlbyOneSC',
    load: () => import('./BowlbyOneSC') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Braah One',
    importName: 'BraahOne',
    load: () => import('./BraahOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Brawler',
    importName: 'Brawler',
    load: () => import('./Brawler') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bree Serif',
    importName: 'BreeSerif',
    load: () => import('./BreeSerif') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bricolage Grotesque',
    importName: 'BricolageGrotesque',
    load: () => import('./BricolageGrotesque') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bruno Ace',
    importName: 'BrunoAce',
    load: () => import('./BrunoAce') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bruno Ace SC',
    importName: 'BrunoAceSC',
    load: () => import('./BrunoAceSC') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Brygada 1918',
    importName: 'Brygada1918',
    load: () => import('./Brygada1918') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bubblegum Sans',
    importName: 'BubblegumSans',
    load: () => import('./BubblegumSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bubbler One',
    importName: 'BubblerOne',
    load: () => import('./BubblerOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Buda',
    importName: 'Buda',
    load: () => import('./Buda') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Buenard',
    importName: 'Buenard',
    load: () => import('./Buenard') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bungee',
    importName: 'Bungee',
    load: () => import('./Bungee') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bungee Hairline',
    importName: 'BungeeHairline',
    load: () => import('./BungeeHairline') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bungee Inline',
    importName: 'BungeeInline',
    load: () => import('./BungeeInline') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bungee Outline',
    importName: 'BungeeOutline',
    load: () => import('./BungeeOutline') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bungee Shade',
    importName: 'BungeeShade',
    load: () => import('./BungeeShade') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Bungee Spice',
    importName: 'BungeeSpice',
    load: () => import('./BungeeSpice') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Butcherman',
    importName: 'Butcherman',
    load: () => import('./Butcherman') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Butterfly Kids',
    importName: 'ButterflyKids',
    load: () => import('./ButterflyKids') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Cabin',
    importName: 'Cabin',
    load: () => import('./Cabin') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Cabin Condensed',
    importName: 'CabinCondensed',
    load: () => import('./CabinCondensed') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Cabin Sketch',
    importName: 'CabinSketch',
    load: () => import('./CabinSketch') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Caesar Dressing',
    importName: 'CaesarDressing',
    load: () => import('./CaesarDressing') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Cagliostro',
    importName: 'Cagliostro',
    load: () => import('./Cagliostro') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Cairo',
    importName: 'Cairo',
    load: () => import('./Cairo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Cairo Play',
    importName: 'CairoPlay',
    load: () => import('./CairoPlay') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Caladea',
    importName: 'Caladea',
    load: () => import('./Caladea') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Calistoga',
    importName: 'Calistoga',
    load: () => import('./Calistoga') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Calligraffitti',
    importName: 'Calligraffitti',
    load: () => import('./Calligraffitti') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Cambay',
    importName: 'Cambay',
    load: () => import('./Cambay') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Cambo',
    importName: 'Cambo',
    load: () => import('./Cambo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Candal',
    importName: 'Candal',
    load: () => import('./Candal') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Cantarell',
    importName: 'Cantarell',
    load: () => import('./Cantarell') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Cantata One',
    importName: 'CantataOne',
    load: () => import('./CantataOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Cantora One',
    importName: 'CantoraOne',
    load: () => import('./CantoraOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Caprasimo',
    importName: 'Caprasimo',
    load: () => import('./Caprasimo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Capriola',
    importName: 'Capriola',
    load: () => import('./Capriola') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Caramel',
    importName: 'Caramel',
    load: () => import('./Caramel') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Carattere',
    importName: 'Carattere',
    load: () => import('./Carattere') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Cardo',
    importName: 'Cardo',
    load: () => import('./Cardo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Carlito',
    importName: 'Carlito',
    load: () => import('./Carlito') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Carme',
    importName: 'Carme',
    load: () => import('./Carme') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Carrois Gothic',
    importName: 'CarroisGothic',
    load: () => import('./CarroisGothic') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Carrois Gothic SC',
    importName: 'CarroisGothicSC',
    load: () => import('./CarroisGothicSC') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Carter One',
    importName: 'CarterOne',
    load: () => import('./CarterOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Castoro',
    importName: 'Castoro',
    load: () => import('./Castoro') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Castoro Titling',
    importName: 'CastoroTitling',
    load: () => import('./CastoroTitling') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Catamaran',
    importName: 'Catamaran',
    load: () => import('./Catamaran') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Caudex',
    importName: 'Caudex',
    load: () => import('./Caudex') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Caveat',
    importName: 'Caveat',
    load: () => import('./Caveat') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Caveat Brush',
    importName: 'CaveatBrush',
    load: () => import('./CaveatBrush') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Cedarville Cursive',
    importName: 'CedarvilleCursive',
    load: () => import('./CedarvilleCursive') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Ceviche One',
    importName: 'CevicheOne',
    load: () => import('./CevicheOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Chakra Petch',
    importName: 'ChakraPetch',
    load: () => import('./ChakraPetch') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Changa',
    importName: 'Changa',
    load: () => import('./Changa') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Changa One',
    importName: 'ChangaOne',
    load: () => import('./ChangaOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Chango',
    importName: 'Chango',
    load: () => import('./Chango') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Charis SIL',
    importName: 'CharisSIL',
    load: () => import('./CharisSIL') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Charm',
    importName: 'Charm',
    load: () => import('./Charm') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Charmonman',
    importName: 'Charmonman',
    load: () => import('./Charmonman') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Chathura',
    importName: 'Chathura',
    load: () => import('./Chathura') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Chau Philomene One',
    importName: 'ChauPhilomeneOne',
    load: () => import('./ChauPhilomeneOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Chela One',
    importName: 'ChelaOne',
    load: () => import('./ChelaOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Chelsea Market',
    importName: 'ChelseaMarket',
    load: () => import('./ChelseaMarket') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Chenla',
    importName: 'Chenla',
    load: () => import('./Chenla') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Cherish',
    importName: 'Cherish',
    load: () => import('./Cherish') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Cherry Bomb One',
    importName: 'CherryBombOne',
    load: () => import('./CherryBombOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Cherry Cream Soda',
    importName: 'CherryCreamSoda',
    load: () => import('./CherryCreamSoda') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Cherry Swash',
    importName: 'CherrySwash',
    load: () => import('./CherrySwash') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Chewy',
    importName: 'Chewy',
    load: () => import('./Chewy') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Chicle',
    importName: 'Chicle',
    load: () => import('./Chicle') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Chilanka',
    importName: 'Chilanka',
    load: () => import('./Chilanka') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Chivo',
    importName: 'Chivo',
    load: () => import('./Chivo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Chivo Mono',
    importName: 'ChivoMono',
    load: () => import('./ChivoMono') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Chokokutai',
    importName: 'Chokokutai',
    load: () => import('./Chokokutai') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Chonburi',
    importName: 'Chonburi',
    load: () => import('./Chonburi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Cinzel',
    importName: 'Cinzel',
    load: () => import('./Cinzel') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Cinzel Decorative',
    importName: 'CinzelDecorative',
    load: () => import('./CinzelDecorative') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Clicker Script',
    importName: 'ClickerScript',
    load: () => import('./ClickerScript') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Climate Crisis',
    importName: 'ClimateCrisis',
    load: () => import('./ClimateCrisis') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Coda',
    importName: 'Coda',
    load: () => import('./Coda') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Codystar',
    importName: 'Codystar',
    load: () => import('./Codystar') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Coiny',
    importName: 'Coiny',
    load: () => import('./Coiny') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Combo',
    importName: 'Combo',
    load: () => import('./Combo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Comfortaa',
    importName: 'Comfortaa',
    load: () => import('./Comfortaa') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Comforter',
    importName: 'Comforter',
    load: () => import('./Comforter') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Comforter Brush',
    importName: 'ComforterBrush',
    load: () => import('./ComforterBrush') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Comic Neue',
    importName: 'ComicNeue',
    load: () => import('./ComicNeue') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Coming Soon',
    importName: 'ComingSoon',
    load: () => import('./ComingSoon') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Comme',
    importName: 'Comme',
    load: () => import('./Comme') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Commissioner',
    importName: 'Commissioner',
    load: () => import('./Commissioner') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Concert One',
    importName: 'ConcertOne',
    load: () => import('./ConcertOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Condiment',
    importName: 'Condiment',
    load: () => import('./Condiment') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Content',
    importName: 'Content',
    load: () => import('./Content') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Contrail One',
    importName: 'ContrailOne',
    load: () => import('./ContrailOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Convergence',
    importName: 'Convergence',
    load: () => import('./Convergence') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Cookie',
    importName: 'Cookie',
    load: () => import('./Cookie') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Copse',
    importName: 'Copse',
    load: () => import('./Copse') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Corben',
    importName: 'Corben',
    load: () => import('./Corben') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Corinthia',
    importName: 'Corinthia',
    load: () => import('./Corinthia') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Cormorant',
    importName: 'Cormorant',
    load: () => import('./Cormorant') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Cormorant Garamond',
    importName: 'CormorantGaramond',
    load: () => import('./CormorantGaramond') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Cormorant Infant',
    importName: 'CormorantInfant',
    load: () => import('./CormorantInfant') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Cormorant SC',
    importName: 'CormorantSC',
    load: () => import('./CormorantSC') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Cormorant Unicase',
    importName: 'CormorantUnicase',
    load: () => import('./CormorantUnicase') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Cormorant Upright',
    importName: 'CormorantUpright',
    load: () => import('./CormorantUpright') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Courgette',
    importName: 'Courgette',
    load: () => import('./Courgette') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Courier Prime',
    importName: 'CourierPrime',
    load: () => import('./CourierPrime') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Cousine',
    importName: 'Cousine',
    load: () => import('./Cousine') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Coustard',
    importName: 'Coustard',
    load: () => import('./Coustard') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Covered By Your Grace',
    importName: 'CoveredByYourGrace',
    load: () => import('./CoveredByYourGrace') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Crafty Girls',
    importName: 'CraftyGirls',
    load: () => import('./CraftyGirls') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Creepster',
    importName: 'Creepster',
    load: () => import('./Creepster') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Crete Round',
    importName: 'CreteRound',
    load: () => import('./CreteRound') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Crimson Pro',
    importName: 'CrimsonPro',
    load: () => import('./CrimsonPro') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Crimson Text',
    importName: 'CrimsonText',
    load: () => import('./CrimsonText') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Croissant One',
    importName: 'CroissantOne',
    load: () => import('./CroissantOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Crushed',
    importName: 'Crushed',
    load: () => import('./Crushed') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Cuprum',
    importName: 'Cuprum',
    load: () => import('./Cuprum') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Cute Font',
    importName: 'CuteFont',
    load: () => import('./CuteFont') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Cutive',
    importName: 'Cutive',
    load: () => import('./Cutive') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Cutive Mono',
    importName: 'CutiveMono',
    load: () => import('./CutiveMono') as Promise<FontInfo>,
  },
  {
    fontFamily: 'DM Mono',
    importName: 'DMMono',
    load: () => import('./DMMono') as Promise<FontInfo>,
  },
  {
    fontFamily: 'DM Sans',
    importName: 'DMSans',
    load: () => import('./DMSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'DM Serif Display',
    importName: 'DMSerifDisplay',
    load: () => import('./DMSerifDisplay') as Promise<FontInfo>,
  },
  {
    fontFamily: 'DM Serif Text',
    importName: 'DMSerifText',
    load: () => import('./DMSerifText') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Dai Banna SIL',
    importName: 'DaiBannaSIL',
    load: () => import('./DaiBannaSIL') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Damion',
    importName: 'Damion',
    load: () => import('./Damion') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Dancing Script',
    importName: 'DancingScript',
    load: () => import('./DancingScript') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Dangrek',
    importName: 'Dangrek',
    load: () => import('./Dangrek') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Darker Grotesque',
    importName: 'DarkerGrotesque',
    load: () => import('./DarkerGrotesque') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Darumadrop One',
    importName: 'DarumadropOne',
    load: () => import('./DarumadropOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'David Libre',
    importName: 'DavidLibre',
    load: () => import('./DavidLibre') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Dawning of a New Day',
    importName: 'DawningofaNewDay',
    load: () => import('./DawningofaNewDay') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Days One',
    importName: 'DaysOne',
    load: () => import('./DaysOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Dekko',
    importName: 'Dekko',
    load: () => import('./Dekko') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Dela Gothic One',
    importName: 'DelaGothicOne',
    load: () => import('./DelaGothicOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Delicious Handrawn',
    importName: 'DeliciousHandrawn',
    load: () => import('./DeliciousHandrawn') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Delius',
    importName: 'Delius',
    load: () => import('./Delius') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Delius Swash Caps',
    importName: 'DeliusSwashCaps',
    load: () => import('./DeliusSwashCaps') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Delius Unicase',
    importName: 'DeliusUnicase',
    load: () => import('./DeliusUnicase') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Della Respira',
    importName: 'DellaRespira',
    load: () => import('./DellaRespira') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Denk One',
    importName: 'DenkOne',
    load: () => import('./DenkOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Devonshire',
    importName: 'Devonshire',
    load: () => import('./Devonshire') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Dhurjati',
    importName: 'Dhurjati',
    load: () => import('./Dhurjati') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Didact Gothic',
    importName: 'DidactGothic',
    load: () => import('./DidactGothic') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Diphylleia',
    importName: 'Diphylleia',
    load: () => import('./Diphylleia') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Diplomata',
    importName: 'Diplomata',
    load: () => import('./Diplomata') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Diplomata SC',
    importName: 'DiplomataSC',
    load: () => import('./DiplomataSC') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Do Hyeon',
    importName: 'DoHyeon',
    load: () => import('./DoHyeon') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Dokdo',
    importName: 'Dokdo',
    load: () => import('./Dokdo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Domine',
    importName: 'Domine',
    load: () => import('./Domine') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Donegal One',
    importName: 'DonegalOne',
    load: () => import('./DonegalOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Dongle',
    importName: 'Dongle',
    load: () => import('./Dongle') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Doppio One',
    importName: 'DoppioOne',
    load: () => import('./DoppioOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Dorsa',
    importName: 'Dorsa',
    load: () => import('./Dorsa') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Dosis',
    importName: 'Dosis',
    load: () => import('./Dosis') as Promise<FontInfo>,
  },
  {
    fontFamily: 'DotGothic16',
    importName: 'DotGothic16',
    load: () => import('./DotGothic16') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Dr Sugiyama',
    importName: 'DrSugiyama',
    load: () => import('./DrSugiyama') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Duru Sans',
    importName: 'DuruSans',
    load: () => import('./DuruSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'DynaPuff',
    importName: 'DynaPuff',
    load: () => import('./DynaPuff') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Dynalight',
    importName: 'Dynalight',
    load: () => import('./Dynalight') as Promise<FontInfo>,
  },
  {
    fontFamily: 'EB Garamond',
    importName: 'EBGaramond',
    load: () => import('./EBGaramond') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Eagle Lake',
    importName: 'EagleLake',
    load: () => import('./EagleLake') as Promise<FontInfo>,
  },
  {
    fontFamily: 'East Sea Dokdo',
    importName: 'EastSeaDokdo',
    load: () => import('./EastSeaDokdo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Eater',
    importName: 'Eater',
    load: () => import('./Eater') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Economica',
    importName: 'Economica',
    load: () => import('./Economica') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Eczar',
    importName: 'Eczar',
    load: () => import('./Eczar') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Edu NSW ACT Foundation',
    importName: 'EduNSWACTFoundation',
    load: () => import('./EduNSWACTFoundation') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Edu QLD Beginner',
    importName: 'EduQLDBeginner',
    load: () => import('./EduQLDBeginner') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Edu SA Beginner',
    importName: 'EduSABeginner',
    load: () => import('./EduSABeginner') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Edu TAS Beginner',
    importName: 'EduTASBeginner',
    load: () => import('./EduTASBeginner') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Edu VIC WA NT Beginner',
    importName: 'EduVICWANTBeginner',
    load: () => import('./EduVICWANTBeginner') as Promise<FontInfo>,
  },
  {
    fontFamily: 'El Messiri',
    importName: 'ElMessiri',
    load: () => import('./ElMessiri') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Electrolize',
    importName: 'Electrolize',
    load: () => import('./Electrolize') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Elsie',
    importName: 'Elsie',
    load: () => import('./Elsie') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Elsie Swash Caps',
    importName: 'ElsieSwashCaps',
    load: () => import('./ElsieSwashCaps') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Emblema One',
    importName: 'EmblemaOne',
    load: () => import('./EmblemaOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Emilys Candy',
    importName: 'EmilysCandy',
    load: () => import('./EmilysCandy') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Encode Sans',
    importName: 'EncodeSans',
    load: () => import('./EncodeSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Encode Sans Condensed',
    importName: 'EncodeSansCondensed',
    load: () => import('./EncodeSansCondensed') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Encode Sans Expanded',
    importName: 'EncodeSansExpanded',
    load: () => import('./EncodeSansExpanded') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Encode Sans SC',
    importName: 'EncodeSansSC',
    load: () => import('./EncodeSansSC') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Encode Sans Semi Condensed',
    importName: 'EncodeSansSemiCondensed',
    load: () => import('./EncodeSansSemiCondensed') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Encode Sans Semi Expanded',
    importName: 'EncodeSansSemiExpanded',
    load: () => import('./EncodeSansSemiExpanded') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Engagement',
    importName: 'Engagement',
    load: () => import('./Engagement') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Englebert',
    importName: 'Englebert',
    load: () => import('./Englebert') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Enriqueta',
    importName: 'Enriqueta',
    load: () => import('./Enriqueta') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Ephesis',
    importName: 'Ephesis',
    load: () => import('./Ephesis') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Epilogue',
    importName: 'Epilogue',
    load: () => import('./Epilogue') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Erica One',
    importName: 'EricaOne',
    load: () => import('./EricaOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Esteban',
    importName: 'Esteban',
    load: () => import('./Esteban') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Estonia',
    importName: 'Estonia',
    load: () => import('./Estonia') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Euphoria Script',
    importName: 'EuphoriaScript',
    load: () => import('./EuphoriaScript') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Ewert',
    importName: 'Ewert',
    load: () => import('./Ewert') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Exo',
    importName: 'Exo',
    load: () => import('./Exo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Exo 2',
    importName: 'Exo2',
    load: () => import('./Exo2') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Expletus Sans',
    importName: 'ExpletusSans',
    load: () => import('./ExpletusSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Explora',
    importName: 'Explora',
    load: () => import('./Explora') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Fahkwang',
    importName: 'Fahkwang',
    load: () => import('./Fahkwang') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Familjen Grotesk',
    importName: 'FamiljenGrotesk',
    load: () => import('./FamiljenGrotesk') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Fanwood Text',
    importName: 'FanwoodText',
    load: () => import('./FanwoodText') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Farro',
    importName: 'Farro',
    load: () => import('./Farro') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Farsan',
    importName: 'Farsan',
    load: () => import('./Farsan') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Fascinate',
    importName: 'Fascinate',
    load: () => import('./Fascinate') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Fascinate Inline',
    importName: 'FascinateInline',
    load: () => import('./FascinateInline') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Faster One',
    importName: 'FasterOne',
    load: () => import('./FasterOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Fasthand',
    importName: 'Fasthand',
    load: () => import('./Fasthand') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Fauna One',
    importName: 'FaunaOne',
    load: () => import('./FaunaOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Faustina',
    importName: 'Faustina',
    load: () => import('./Faustina') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Federant',
    importName: 'Federant',
    load: () => import('./Federant') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Federo',
    importName: 'Federo',
    load: () => import('./Federo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Felipa',
    importName: 'Felipa',
    load: () => import('./Felipa') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Fenix',
    importName: 'Fenix',
    load: () => import('./Fenix') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Festive',
    importName: 'Festive',
    load: () => import('./Festive') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Figtree',
    importName: 'Figtree',
    load: () => import('./Figtree') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Finger Paint',
    importName: 'FingerPaint',
    load: () => import('./FingerPaint') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Finlandica',
    importName: 'Finlandica',
    load: () => import('./Finlandica') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Fira Code',
    importName: 'FiraCode',
    load: () => import('./FiraCode') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Fira Mono',
    importName: 'FiraMono',
    load: () => import('./FiraMono') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Fira Sans',
    importName: 'FiraSans',
    load: () => import('./FiraSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Fira Sans Condensed',
    importName: 'FiraSansCondensed',
    load: () => import('./FiraSansCondensed') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Fira Sans Extra Condensed',
    importName: 'FiraSansExtraCondensed',
    load: () => import('./FiraSansExtraCondensed') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Fjalla One',
    importName: 'FjallaOne',
    load: () => import('./FjallaOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Fjord One',
    importName: 'FjordOne',
    load: () => import('./FjordOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Flamenco',
    importName: 'Flamenco',
    load: () => import('./Flamenco') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Flavors',
    importName: 'Flavors',
    load: () => import('./Flavors') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Fleur De Leah',
    importName: 'FleurDeLeah',
    load: () => import('./FleurDeLeah') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Flow Block',
    importName: 'FlowBlock',
    load: () => import('./FlowBlock') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Flow Circular',
    importName: 'FlowCircular',
    load: () => import('./FlowCircular') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Flow Rounded',
    importName: 'FlowRounded',
    load: () => import('./FlowRounded') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Foldit',
    importName: 'Foldit',
    load: () => import('./Foldit') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Fondamento',
    importName: 'Fondamento',
    load: () => import('./Fondamento') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Fontdiner Swanky',
    importName: 'FontdinerSwanky',
    load: () => import('./FontdinerSwanky') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Forum',
    importName: 'Forum',
    load: () => import('./Forum') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Fragment Mono',
    importName: 'FragmentMono',
    load: () => import('./FragmentMono') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Francois One',
    importName: 'FrancoisOne',
    load: () => import('./FrancoisOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Frank Ruhl Libre',
    importName: 'FrankRuhlLibre',
    load: () => import('./FrankRuhlLibre') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Fraunces',
    importName: 'Fraunces',
    load: () => import('./Fraunces') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Freckle Face',
    importName: 'FreckleFace',
    load: () => import('./FreckleFace') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Fredericka the Great',
    importName: 'FrederickatheGreat',
    load: () => import('./FrederickatheGreat') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Fredoka',
    importName: 'Fredoka',
    load: () => import('./Fredoka') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Freehand',
    importName: 'Freehand',
    load: () => import('./Freehand') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Fresca',
    importName: 'Fresca',
    load: () => import('./Fresca') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Frijole',
    importName: 'Frijole',
    load: () => import('./Frijole') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Fruktur',
    importName: 'Fruktur',
    load: () => import('./Fruktur') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Fugaz One',
    importName: 'FugazOne',
    load: () => import('./FugazOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Fuggles',
    importName: 'Fuggles',
    load: () => import('./Fuggles') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Fuzzy Bubbles',
    importName: 'FuzzyBubbles',
    load: () => import('./FuzzyBubbles') as Promise<FontInfo>,
  },
  {
    fontFamily: 'GFS Didot',
    importName: 'GFSDidot',
    load: () => import('./GFSDidot') as Promise<FontInfo>,
  },
  {
    fontFamily: 'GFS Neohellenic',
    importName: 'GFSNeohellenic',
    load: () => import('./GFSNeohellenic') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Gabarito',
    importName: 'Gabarito',
    load: () => import('./Gabarito') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Gabriela',
    importName: 'Gabriela',
    load: () => import('./Gabriela') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Gaegu',
    importName: 'Gaegu',
    load: () => import('./Gaegu') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Gafata',
    importName: 'Gafata',
    load: () => import('./Gafata') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Gajraj One',
    importName: 'GajrajOne',
    load: () => import('./GajrajOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Galada',
    importName: 'Galada',
    load: () => import('./Galada') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Galdeano',
    importName: 'Galdeano',
    load: () => import('./Galdeano') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Galindo',
    importName: 'Galindo',
    load: () => import('./Galindo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Gamja Flower',
    importName: 'GamjaFlower',
    load: () => import('./GamjaFlower') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Gantari',
    importName: 'Gantari',
    load: () => import('./Gantari') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Gasoek One',
    importName: 'GasoekOne',
    load: () => import('./GasoekOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Gayathri',
    importName: 'Gayathri',
    load: () => import('./Gayathri') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Gelasio',
    importName: 'Gelasio',
    load: () => import('./Gelasio') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Gemunu Libre',
    importName: 'GemunuLibre',
    load: () => import('./GemunuLibre') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Genos',
    importName: 'Genos',
    load: () => import('./Genos') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Gentium Book Plus',
    importName: 'GentiumBookPlus',
    load: () => import('./GentiumBookPlus') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Gentium Plus',
    importName: 'GentiumPlus',
    load: () => import('./GentiumPlus') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Geo',
    importName: 'Geo',
    load: () => import('./Geo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Geologica',
    importName: 'Geologica',
    load: () => import('./Geologica') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Georama',
    importName: 'Georama',
    load: () => import('./Georama') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Geostar',
    importName: 'Geostar',
    load: () => import('./Geostar') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Geostar Fill',
    importName: 'GeostarFill',
    load: () => import('./GeostarFill') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Germania One',
    importName: 'GermaniaOne',
    load: () => import('./GermaniaOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Gideon Roman',
    importName: 'GideonRoman',
    load: () => import('./GideonRoman') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Gidugu',
    importName: 'Gidugu',
    load: () => import('./Gidugu') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Gilda Display',
    importName: 'GildaDisplay',
    load: () => import('./GildaDisplay') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Girassol',
    importName: 'Girassol',
    load: () => import('./Girassol') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Give You Glory',
    importName: 'GiveYouGlory',
    load: () => import('./GiveYouGlory') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Glass Antiqua',
    importName: 'GlassAntiqua',
    load: () => import('./GlassAntiqua') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Glegoo',
    importName: 'Glegoo',
    load: () => import('./Glegoo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Gloock',
    importName: 'Gloock',
    load: () => import('./Gloock') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Gloria Hallelujah',
    importName: 'GloriaHallelujah',
    load: () => import('./GloriaHallelujah') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Glory',
    importName: 'Glory',
    load: () => import('./Glory') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Gluten',
    importName: 'Gluten',
    load: () => import('./Gluten') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Goblin One',
    importName: 'GoblinOne',
    load: () => import('./GoblinOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Gochi Hand',
    importName: 'GochiHand',
    load: () => import('./GochiHand') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Goldman',
    importName: 'Goldman',
    load: () => import('./Goldman') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Golos Text',
    importName: 'GolosText',
    load: () => import('./GolosText') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Gorditas',
    importName: 'Gorditas',
    load: () => import('./Gorditas') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Gothic A1',
    importName: 'GothicA1',
    load: () => import('./GothicA1') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Gotu',
    importName: 'Gotu',
    load: () => import('./Gotu') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Goudy Bookletter 1911',
    importName: 'GoudyBookletter1911',
    load: () => import('./GoudyBookletter1911') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Gowun Batang',
    importName: 'GowunBatang',
    load: () => import('./GowunBatang') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Gowun Dodum',
    importName: 'GowunDodum',
    load: () => import('./GowunDodum') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Graduate',
    importName: 'Graduate',
    load: () => import('./Graduate') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Grand Hotel',
    importName: 'GrandHotel',
    load: () => import('./GrandHotel') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Grandiflora One',
    importName: 'GrandifloraOne',
    load: () => import('./GrandifloraOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Grandstander',
    importName: 'Grandstander',
    load: () => import('./Grandstander') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Grape Nuts',
    importName: 'GrapeNuts',
    load: () => import('./GrapeNuts') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Gravitas One',
    importName: 'GravitasOne',
    load: () => import('./GravitasOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Great Vibes',
    importName: 'GreatVibes',
    load: () => import('./GreatVibes') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Grechen Fuemen',
    importName: 'GrechenFuemen',
    load: () => import('./GrechenFuemen') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Grenze',
    importName: 'Grenze',
    load: () => import('./Grenze') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Grenze Gotisch',
    importName: 'GrenzeGotisch',
    load: () => import('./GrenzeGotisch') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Grey Qo',
    importName: 'GreyQo',
    load: () => import('./GreyQo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Griffy',
    importName: 'Griffy',
    load: () => import('./Griffy') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Gruppo',
    importName: 'Gruppo',
    load: () => import('./Gruppo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Gudea',
    importName: 'Gudea',
    load: () => import('./Gudea') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Gugi',
    importName: 'Gugi',
    load: () => import('./Gugi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Gulzar',
    importName: 'Gulzar',
    load: () => import('./Gulzar') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Gupter',
    importName: 'Gupter',
    load: () => import('./Gupter') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Gurajada',
    importName: 'Gurajada',
    load: () => import('./Gurajada') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Gwendolyn',
    importName: 'Gwendolyn',
    load: () => import('./Gwendolyn') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Habibi',
    importName: 'Habibi',
    load: () => import('./Habibi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Hachi Maru Pop',
    importName: 'HachiMaruPop',
    load: () => import('./HachiMaruPop') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Hahmlet',
    importName: 'Hahmlet',
    load: () => import('./Hahmlet') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Halant',
    importName: 'Halant',
    load: () => import('./Halant') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Hammersmith One',
    importName: 'HammersmithOne',
    load: () => import('./HammersmithOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Hanalei',
    importName: 'Hanalei',
    load: () => import('./Hanalei') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Hanalei Fill',
    importName: 'HanaleiFill',
    load: () => import('./HanaleiFill') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Handjet',
    importName: 'Handjet',
    load: () => import('./Handjet') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Handlee',
    importName: 'Handlee',
    load: () => import('./Handlee') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Hanken Grotesk',
    importName: 'HankenGrotesk',
    load: () => import('./HankenGrotesk') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Hanuman',
    importName: 'Hanuman',
    load: () => import('./Hanuman') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Happy Monkey',
    importName: 'HappyMonkey',
    load: () => import('./HappyMonkey') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Harmattan',
    importName: 'Harmattan',
    load: () => import('./Harmattan') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Headland One',
    importName: 'HeadlandOne',
    load: () => import('./HeadlandOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Heebo',
    importName: 'Heebo',
    load: () => import('./Heebo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Henny Penny',
    importName: 'HennyPenny',
    load: () => import('./HennyPenny') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Hepta Slab',
    importName: 'HeptaSlab',
    load: () => import('./HeptaSlab') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Herr Von Muellerhoff',
    importName: 'HerrVonMuellerhoff',
    load: () => import('./HerrVonMuellerhoff') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Hi Melody',
    importName: 'HiMelody',
    load: () => import('./HiMelody') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Hina Mincho',
    importName: 'HinaMincho',
    load: () => import('./HinaMincho') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Hind',
    importName: 'Hind',
    load: () => import('./Hind') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Hind Guntur',
    importName: 'HindGuntur',
    load: () => import('./HindGuntur') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Hind Madurai',
    importName: 'HindMadurai',
    load: () => import('./HindMadurai') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Hind Siliguri',
    importName: 'HindSiliguri',
    load: () => import('./HindSiliguri') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Hind Vadodara',
    importName: 'HindVadodara',
    load: () => import('./HindVadodara') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Holtwood One SC',
    importName: 'HoltwoodOneSC',
    load: () => import('./HoltwoodOneSC') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Homemade Apple',
    importName: 'HomemadeApple',
    load: () => import('./HomemadeApple') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Homenaje',
    importName: 'Homenaje',
    load: () => import('./Homenaje') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Hubballi',
    importName: 'Hubballi',
    load: () => import('./Hubballi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Hurricane',
    importName: 'Hurricane',
    load: () => import('./Hurricane') as Promise<FontInfo>,
  },
  {
    fontFamily: 'IBM Plex Mono',
    importName: 'IBMPlexMono',
    load: () => import('./IBMPlexMono') as Promise<FontInfo>,
  },
  {
    fontFamily: 'IBM Plex Sans',
    importName: 'IBMPlexSans',
    load: () => import('./IBMPlexSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'IBM Plex Sans Arabic',
    importName: 'IBMPlexSansArabic',
    load: () => import('./IBMPlexSansArabic') as Promise<FontInfo>,
  },
  {
    fontFamily: 'IBM Plex Sans Condensed',
    importName: 'IBMPlexSansCondensed',
    load: () => import('./IBMPlexSansCondensed') as Promise<FontInfo>,
  },
  {
    fontFamily: 'IBM Plex Sans Devanagari',
    importName: 'IBMPlexSansDevanagari',
    load: () => import('./IBMPlexSansDevanagari') as Promise<FontInfo>,
  },
  {
    fontFamily: 'IBM Plex Sans Hebrew',
    importName: 'IBMPlexSansHebrew',
    load: () => import('./IBMPlexSansHebrew') as Promise<FontInfo>,
  },
  {
    fontFamily: 'IBM Plex Sans JP',
    importName: 'IBMPlexSansJP',
    load: () => import('./IBMPlexSansJP') as Promise<FontInfo>,
  },
  {
    fontFamily: 'IBM Plex Sans KR',
    importName: 'IBMPlexSansKR',
    load: () => import('./IBMPlexSansKR') as Promise<FontInfo>,
  },
  {
    fontFamily: 'IBM Plex Sans Thai',
    importName: 'IBMPlexSansThai',
    load: () => import('./IBMPlexSansThai') as Promise<FontInfo>,
  },
  {
    fontFamily: 'IBM Plex Sans Thai Looped',
    importName: 'IBMPlexSansThaiLooped',
    load: () => import('./IBMPlexSansThaiLooped') as Promise<FontInfo>,
  },
  {
    fontFamily: 'IBM Plex Serif',
    importName: 'IBMPlexSerif',
    load: () => import('./IBMPlexSerif') as Promise<FontInfo>,
  },
  {
    fontFamily: 'IM Fell DW Pica',
    importName: 'IMFellDWPica',
    load: () => import('./IMFellDWPica') as Promise<FontInfo>,
  },
  {
    fontFamily: 'IM Fell DW Pica SC',
    importName: 'IMFellDWPicaSC',
    load: () => import('./IMFellDWPicaSC') as Promise<FontInfo>,
  },
  {
    fontFamily: 'IM Fell Double Pica',
    importName: 'IMFellDoublePica',
    load: () => import('./IMFellDoublePica') as Promise<FontInfo>,
  },
  {
    fontFamily: 'IM Fell Double Pica SC',
    importName: 'IMFellDoublePicaSC',
    load: () => import('./IMFellDoublePicaSC') as Promise<FontInfo>,
  },
  {
    fontFamily: 'IM Fell English',
    importName: 'IMFellEnglish',
    load: () => import('./IMFellEnglish') as Promise<FontInfo>,
  },
  {
    fontFamily: 'IM Fell English SC',
    importName: 'IMFellEnglishSC',
    load: () => import('./IMFellEnglishSC') as Promise<FontInfo>,
  },
  {
    fontFamily: 'IM Fell French Canon',
    importName: 'IMFellFrenchCanon',
    load: () => import('./IMFellFrenchCanon') as Promise<FontInfo>,
  },
  {
    fontFamily: 'IM Fell French Canon SC',
    importName: 'IMFellFrenchCanonSC',
    load: () => import('./IMFellFrenchCanonSC') as Promise<FontInfo>,
  },
  {
    fontFamily: 'IM Fell Great Primer',
    importName: 'IMFellGreatPrimer',
    load: () => import('./IMFellGreatPrimer') as Promise<FontInfo>,
  },
  {
    fontFamily: 'IM Fell Great Primer SC',
    importName: 'IMFellGreatPrimerSC',
    load: () => import('./IMFellGreatPrimerSC') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Ibarra Real Nova',
    importName: 'IbarraRealNova',
    load: () => import('./IbarraRealNova') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Iceberg',
    importName: 'Iceberg',
    load: () => import('./Iceberg') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Iceland',
    importName: 'Iceland',
    load: () => import('./Iceland') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Imbue',
    importName: 'Imbue',
    load: () => import('./Imbue') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Imperial Script',
    importName: 'ImperialScript',
    load: () => import('./ImperialScript') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Imprima',
    importName: 'Imprima',
    load: () => import('./Imprima') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Inclusive Sans',
    importName: 'InclusiveSans',
    load: () => import('./InclusiveSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Inconsolata',
    importName: 'Inconsolata',
    load: () => import('./Inconsolata') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Inder',
    importName: 'Inder',
    load: () => import('./Inder') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Indie Flower',
    importName: 'IndieFlower',
    load: () => import('./IndieFlower') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Ingrid Darling',
    importName: 'IngridDarling',
    load: () => import('./IngridDarling') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Inika',
    importName: 'Inika',
    load: () => import('./Inika') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Inknut Antiqua',
    importName: 'InknutAntiqua',
    load: () => import('./InknutAntiqua') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Inria Sans',
    importName: 'InriaSans',
    load: () => import('./InriaSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Inria Serif',
    importName: 'InriaSerif',
    load: () => import('./InriaSerif') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Inspiration',
    importName: 'Inspiration',
    load: () => import('./Inspiration') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Instrument Sans',
    importName: 'InstrumentSans',
    load: () => import('./InstrumentSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Instrument Serif',
    importName: 'InstrumentSerif',
    load: () => import('./InstrumentSerif') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Inter',
    importName: 'Inter',
    load: () => import('./Inter') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Inter Tight',
    importName: 'InterTight',
    load: () => import('./InterTight') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Irish Grover',
    importName: 'IrishGrover',
    load: () => import('./IrishGrover') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Island Moments',
    importName: 'IslandMoments',
    load: () => import('./IslandMoments') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Istok Web',
    importName: 'IstokWeb',
    load: () => import('./IstokWeb') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Italiana',
    importName: 'Italiana',
    load: () => import('./Italiana') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Italianno',
    importName: 'Italianno',
    load: () => import('./Italianno') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Itim',
    importName: 'Itim',
    load: () => import('./Itim') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Jacques Francois',
    importName: 'JacquesFrancois',
    load: () => import('./JacquesFrancois') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Jacques Francois Shadow',
    importName: 'JacquesFrancoisShadow',
    load: () => import('./JacquesFrancoisShadow') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Jaldi',
    importName: 'Jaldi',
    load: () => import('./Jaldi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'JetBrains Mono',
    importName: 'JetBrainsMono',
    load: () => import('./JetBrainsMono') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Jim Nightshade',
    importName: 'JimNightshade',
    load: () => import('./JimNightshade') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Joan',
    importName: 'Joan',
    load: () => import('./Joan') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Jockey One',
    importName: 'JockeyOne',
    load: () => import('./JockeyOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Jolly Lodger',
    importName: 'JollyLodger',
    load: () => import('./JollyLodger') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Jomhuria',
    importName: 'Jomhuria',
    load: () => import('./Jomhuria') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Jomolhari',
    importName: 'Jomolhari',
    load: () => import('./Jomolhari') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Josefin Sans',
    importName: 'JosefinSans',
    load: () => import('./JosefinSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Josefin Slab',
    importName: 'JosefinSlab',
    load: () => import('./JosefinSlab') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Jost',
    importName: 'Jost',
    load: () => import('./Jost') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Joti One',
    importName: 'JotiOne',
    load: () => import('./JotiOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Jua',
    importName: 'Jua',
    load: () => import('./Jua') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Judson',
    importName: 'Judson',
    load: () => import('./Judson') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Julee',
    importName: 'Julee',
    load: () => import('./Julee') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Julius Sans One',
    importName: 'JuliusSansOne',
    load: () => import('./JuliusSansOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Junge',
    importName: 'Junge',
    load: () => import('./Junge') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Jura',
    importName: 'Jura',
    load: () => import('./Jura') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Just Another Hand',
    importName: 'JustAnotherHand',
    load: () => import('./JustAnotherHand') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Just Me Again Down Here',
    importName: 'JustMeAgainDownHere',
    load: () => import('./JustMeAgainDownHere') as Promise<FontInfo>,
  },
  {
    fontFamily: 'K2D',
    importName: 'K2D',
    load: () => import('./K2D') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Kablammo',
    importName: 'Kablammo',
    load: () => import('./Kablammo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Kadwa',
    importName: 'Kadwa',
    load: () => import('./Kadwa') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Kaisei Decol',
    importName: 'KaiseiDecol',
    load: () => import('./KaiseiDecol') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Kaisei HarunoUmi',
    importName: 'KaiseiHarunoUmi',
    load: () => import('./KaiseiHarunoUmi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Kaisei Opti',
    importName: 'KaiseiOpti',
    load: () => import('./KaiseiOpti') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Kaisei Tokumin',
    importName: 'KaiseiTokumin',
    load: () => import('./KaiseiTokumin') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Kalam',
    importName: 'Kalam',
    load: () => import('./Kalam') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Kameron',
    importName: 'Kameron',
    load: () => import('./Kameron') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Kanit',
    importName: 'Kanit',
    load: () => import('./Kanit') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Kantumruy Pro',
    importName: 'KantumruyPro',
    load: () => import('./KantumruyPro') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Karantina',
    importName: 'Karantina',
    load: () => import('./Karantina') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Karla',
    importName: 'Karla',
    load: () => import('./Karla') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Karma',
    importName: 'Karma',
    load: () => import('./Karma') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Katibeh',
    importName: 'Katibeh',
    load: () => import('./Katibeh') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Kaushan Script',
    importName: 'KaushanScript',
    load: () => import('./KaushanScript') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Kavivanar',
    importName: 'Kavivanar',
    load: () => import('./Kavivanar') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Kavoon',
    importName: 'Kavoon',
    load: () => import('./Kavoon') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Kay Pho Du',
    importName: 'KayPhoDu',
    load: () => import('./KayPhoDu') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Kdam Thmor Pro',
    importName: 'KdamThmorPro',
    load: () => import('./KdamThmorPro') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Keania One',
    importName: 'KeaniaOne',
    load: () => import('./KeaniaOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Kelly Slab',
    importName: 'KellySlab',
    load: () => import('./KellySlab') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Kenia',
    importName: 'Kenia',
    load: () => import('./Kenia') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Khand',
    importName: 'Khand',
    load: () => import('./Khand') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Khmer',
    importName: 'Khmer',
    load: () => import('./Khmer') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Khula',
    importName: 'Khula',
    load: () => import('./Khula') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Kings',
    importName: 'Kings',
    load: () => import('./Kings') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Kirang Haerang',
    importName: 'KirangHaerang',
    load: () => import('./KirangHaerang') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Kite One',
    importName: 'KiteOne',
    load: () => import('./KiteOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Kiwi Maru',
    importName: 'KiwiMaru',
    load: () => import('./KiwiMaru') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Klee One',
    importName: 'KleeOne',
    load: () => import('./KleeOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Knewave',
    importName: 'Knewave',
    load: () => import('./Knewave') as Promise<FontInfo>,
  },
  {
    fontFamily: 'KoHo',
    importName: 'KoHo',
    load: () => import('./KoHo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Kodchasan',
    importName: 'Kodchasan',
    load: () => import('./Kodchasan') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Koh Santepheap',
    importName: 'KohSantepheap',
    load: () => import('./KohSantepheap') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Kolker Brush',
    importName: 'KolkerBrush',
    load: () => import('./KolkerBrush') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Konkhmer Sleokchher',
    importName: 'KonkhmerSleokchher',
    load: () => import('./KonkhmerSleokchher') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Kosugi',
    importName: 'Kosugi',
    load: () => import('./Kosugi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Kosugi Maru',
    importName: 'KosugiMaru',
    load: () => import('./KosugiMaru') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Kotta One',
    importName: 'KottaOne',
    load: () => import('./KottaOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Koulen',
    importName: 'Koulen',
    load: () => import('./Koulen') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Kranky',
    importName: 'Kranky',
    load: () => import('./Kranky') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Kreon',
    importName: 'Kreon',
    load: () => import('./Kreon') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Kristi',
    importName: 'Kristi',
    load: () => import('./Kristi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Krona One',
    importName: 'KronaOne',
    load: () => import('./KronaOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Krub',
    importName: 'Krub',
    load: () => import('./Krub') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Kufam',
    importName: 'Kufam',
    load: () => import('./Kufam') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Kulim Park',
    importName: 'KulimPark',
    load: () => import('./KulimPark') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Kumar One',
    importName: 'KumarOne',
    load: () => import('./KumarOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Kumar One Outline',
    importName: 'KumarOneOutline',
    load: () => import('./KumarOneOutline') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Kumbh Sans',
    importName: 'KumbhSans',
    load: () => import('./KumbhSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Kurale',
    importName: 'Kurale',
    load: () => import('./Kurale') as Promise<FontInfo>,
  },
  {
    fontFamily: 'La Belle Aurore',
    importName: 'LaBelleAurore',
    load: () => import('./LaBelleAurore') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Labrada',
    importName: 'Labrada',
    load: () => import('./Labrada') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Lacquer',
    importName: 'Lacquer',
    load: () => import('./Lacquer') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Laila',
    importName: 'Laila',
    load: () => import('./Laila') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Lakki Reddy',
    importName: 'LakkiReddy',
    load: () => import('./LakkiReddy') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Lalezar',
    importName: 'Lalezar',
    load: () => import('./Lalezar') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Lancelot',
    importName: 'Lancelot',
    load: () => import('./Lancelot') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Langar',
    importName: 'Langar',
    load: () => import('./Langar') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Lateef',
    importName: 'Lateef',
    load: () => import('./Lateef') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Lato',
    importName: 'Lato',
    load: () => import('./Lato') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Lavishly Yours',
    importName: 'LavishlyYours',
    load: () => import('./LavishlyYours') as Promise<FontInfo>,
  },
  {
    fontFamily: 'League Gothic',
    importName: 'LeagueGothic',
    load: () => import('./LeagueGothic') as Promise<FontInfo>,
  },
  {
    fontFamily: 'League Script',
    importName: 'LeagueScript',
    load: () => import('./LeagueScript') as Promise<FontInfo>,
  },
  {
    fontFamily: 'League Spartan',
    importName: 'LeagueSpartan',
    load: () => import('./LeagueSpartan') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Leckerli One',
    importName: 'LeckerliOne',
    load: () => import('./LeckerliOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Ledger',
    importName: 'Ledger',
    load: () => import('./Ledger') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Lekton',
    importName: 'Lekton',
    load: () => import('./Lekton') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Lemon',
    importName: 'Lemon',
    load: () => import('./Lemon') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Lemonada',
    importName: 'Lemonada',
    load: () => import('./Lemonada') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Lexend',
    importName: 'Lexend',
    load: () => import('./Lexend') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Lexend Deca',
    importName: 'LexendDeca',
    load: () => import('./LexendDeca') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Lexend Exa',
    importName: 'LexendExa',
    load: () => import('./LexendExa') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Lexend Giga',
    importName: 'LexendGiga',
    load: () => import('./LexendGiga') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Lexend Mega',
    importName: 'LexendMega',
    load: () => import('./LexendMega') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Lexend Peta',
    importName: 'LexendPeta',
    load: () => import('./LexendPeta') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Lexend Tera',
    importName: 'LexendTera',
    load: () => import('./LexendTera') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Lexend Zetta',
    importName: 'LexendZetta',
    load: () => import('./LexendZetta') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Libre Barcode 128',
    importName: 'LibreBarcode128',
    load: () => import('./LibreBarcode128') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Libre Barcode 128 Text',
    importName: 'LibreBarcode128Text',
    load: () => import('./LibreBarcode128Text') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Libre Barcode 39',
    importName: 'LibreBarcode39',
    load: () => import('./LibreBarcode39') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Libre Barcode 39 Extended',
    importName: 'LibreBarcode39Extended',
    load: () => import('./LibreBarcode39Extended') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Libre Barcode 39 Extended Text',
    importName: 'LibreBarcode39ExtendedText',
    load: () => import('./LibreBarcode39ExtendedText') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Libre Barcode 39 Text',
    importName: 'LibreBarcode39Text',
    load: () => import('./LibreBarcode39Text') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Libre Barcode EAN13 Text',
    importName: 'LibreBarcodeEAN13Text',
    load: () => import('./LibreBarcodeEAN13Text') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Libre Baskerville',
    importName: 'LibreBaskerville',
    load: () => import('./LibreBaskerville') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Libre Bodoni',
    importName: 'LibreBodoni',
    load: () => import('./LibreBodoni') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Libre Caslon Display',
    importName: 'LibreCaslonDisplay',
    load: () => import('./LibreCaslonDisplay') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Libre Caslon Text',
    importName: 'LibreCaslonText',
    load: () => import('./LibreCaslonText') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Libre Franklin',
    importName: 'LibreFranklin',
    load: () => import('./LibreFranklin') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Licorice',
    importName: 'Licorice',
    load: () => import('./Licorice') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Life Savers',
    importName: 'LifeSavers',
    load: () => import('./LifeSavers') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Lilita One',
    importName: 'LilitaOne',
    load: () => import('./LilitaOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Lily Script One',
    importName: 'LilyScriptOne',
    load: () => import('./LilyScriptOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Limelight',
    importName: 'Limelight',
    load: () => import('./Limelight') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Linden Hill',
    importName: 'LindenHill',
    load: () => import('./LindenHill') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Linefont',
    importName: 'Linefont',
    load: () => import('./Linefont') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Lisu Bosa',
    importName: 'LisuBosa',
    load: () => import('./LisuBosa') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Literata',
    importName: 'Literata',
    load: () => import('./Literata') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Liu Jian Mao Cao',
    importName: 'LiuJianMaoCao',
    load: () => import('./LiuJianMaoCao') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Livvic',
    importName: 'Livvic',
    load: () => import('./Livvic') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Lobster',
    importName: 'Lobster',
    load: () => import('./Lobster') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Lobster Two',
    importName: 'LobsterTwo',
    load: () => import('./LobsterTwo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Londrina Outline',
    importName: 'LondrinaOutline',
    load: () => import('./LondrinaOutline') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Londrina Shadow',
    importName: 'LondrinaShadow',
    load: () => import('./LondrinaShadow') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Londrina Sketch',
    importName: 'LondrinaSketch',
    load: () => import('./LondrinaSketch') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Londrina Solid',
    importName: 'LondrinaSolid',
    load: () => import('./LondrinaSolid') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Long Cang',
    importName: 'LongCang',
    load: () => import('./LongCang') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Lora',
    importName: 'Lora',
    load: () => import('./Lora') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Love Light',
    importName: 'LoveLight',
    load: () => import('./LoveLight') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Love Ya Like A Sister',
    importName: 'LoveYaLikeASister',
    load: () => import('./LoveYaLikeASister') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Loved by the King',
    importName: 'LovedbytheKing',
    load: () => import('./LovedbytheKing') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Lovers Quarrel',
    importName: 'LoversQuarrel',
    load: () => import('./LoversQuarrel') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Luckiest Guy',
    importName: 'LuckiestGuy',
    load: () => import('./LuckiestGuy') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Lugrasimo',
    importName: 'Lugrasimo',
    load: () => import('./Lugrasimo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Lumanosimo',
    importName: 'Lumanosimo',
    load: () => import('./Lumanosimo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Lunasima',
    importName: 'Lunasima',
    load: () => import('./Lunasima') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Lusitana',
    importName: 'Lusitana',
    load: () => import('./Lusitana') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Lustria',
    importName: 'Lustria',
    load: () => import('./Lustria') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Luxurious Roman',
    importName: 'LuxuriousRoman',
    load: () => import('./LuxuriousRoman') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Luxurious Script',
    importName: 'LuxuriousScript',
    load: () => import('./LuxuriousScript') as Promise<FontInfo>,
  },
  {
    fontFamily: 'M PLUS 1',
    importName: 'MPLUS1',
    load: () => import('./MPLUS1') as Promise<FontInfo>,
  },
  {
    fontFamily: 'M PLUS 1 Code',
    importName: 'MPLUS1Code',
    load: () => import('./MPLUS1Code') as Promise<FontInfo>,
  },
  {
    fontFamily: 'M PLUS 1p',
    importName: 'MPLUS1p',
    load: () => import('./MPLUS1p') as Promise<FontInfo>,
  },
  {
    fontFamily: 'M PLUS 2',
    importName: 'MPLUS2',
    load: () => import('./MPLUS2') as Promise<FontInfo>,
  },
  {
    fontFamily: 'M PLUS Code Latin',
    importName: 'MPLUSCodeLatin',
    load: () => import('./MPLUSCodeLatin') as Promise<FontInfo>,
  },
  {
    fontFamily: 'M PLUS Rounded 1c',
    importName: 'MPLUSRounded1c',
    load: () => import('./MPLUSRounded1c') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Ma Shan Zheng',
    importName: 'MaShanZheng',
    load: () => import('./MaShanZheng') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Macondo',
    importName: 'Macondo',
    load: () => import('./Macondo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Macondo Swash Caps',
    importName: 'MacondoSwashCaps',
    load: () => import('./MacondoSwashCaps') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Mada',
    importName: 'Mada',
    load: () => import('./Mada') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Magra',
    importName: 'Magra',
    load: () => import('./Magra') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Maiden Orange',
    importName: 'MaidenOrange',
    load: () => import('./MaidenOrange') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Maitree',
    importName: 'Maitree',
    load: () => import('./Maitree') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Major Mono Display',
    importName: 'MajorMonoDisplay',
    load: () => import('./MajorMonoDisplay') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Mako',
    importName: 'Mako',
    load: () => import('./Mako') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Mali',
    importName: 'Mali',
    load: () => import('./Mali') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Mallanna',
    importName: 'Mallanna',
    load: () => import('./Mallanna') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Mandali',
    importName: 'Mandali',
    load: () => import('./Mandali') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Manjari',
    importName: 'Manjari',
    load: () => import('./Manjari') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Manrope',
    importName: 'Manrope',
    load: () => import('./Manrope') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Mansalva',
    importName: 'Mansalva',
    load: () => import('./Mansalva') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Manuale',
    importName: 'Manuale',
    load: () => import('./Manuale') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Marcellus',
    importName: 'Marcellus',
    load: () => import('./Marcellus') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Marcellus SC',
    importName: 'MarcellusSC',
    load: () => import('./MarcellusSC') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Marck Script',
    importName: 'MarckScript',
    load: () => import('./MarckScript') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Margarine',
    importName: 'Margarine',
    load: () => import('./Margarine') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Marhey',
    importName: 'Marhey',
    load: () => import('./Marhey') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Markazi Text',
    importName: 'MarkaziText',
    load: () => import('./MarkaziText') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Marko One',
    importName: 'MarkoOne',
    load: () => import('./MarkoOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Marmelad',
    importName: 'Marmelad',
    load: () => import('./Marmelad') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Martel',
    importName: 'Martel',
    load: () => import('./Martel') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Martel Sans',
    importName: 'MartelSans',
    load: () => import('./MartelSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Martian Mono',
    importName: 'MartianMono',
    load: () => import('./MartianMono') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Marvel',
    importName: 'Marvel',
    load: () => import('./Marvel') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Mate',
    importName: 'Mate',
    load: () => import('./Mate') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Mate SC',
    importName: 'MateSC',
    load: () => import('./MateSC') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Maven Pro',
    importName: 'MavenPro',
    load: () => import('./MavenPro') as Promise<FontInfo>,
  },
  {
    fontFamily: 'McLaren',
    importName: 'McLaren',
    load: () => import('./McLaren') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Mea Culpa',
    importName: 'MeaCulpa',
    load: () => import('./MeaCulpa') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Meddon',
    importName: 'Meddon',
    load: () => import('./Meddon') as Promise<FontInfo>,
  },
  {
    fontFamily: 'MedievalSharp',
    importName: 'MedievalSharp',
    load: () => import('./MedievalSharp') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Medula One',
    importName: 'MedulaOne',
    load: () => import('./MedulaOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Meera Inimai',
    importName: 'MeeraInimai',
    load: () => import('./MeeraInimai') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Megrim',
    importName: 'Megrim',
    load: () => import('./Megrim') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Meie Script',
    importName: 'MeieScript',
    load: () => import('./MeieScript') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Meow Script',
    importName: 'MeowScript',
    load: () => import('./MeowScript') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Merienda',
    importName: 'Merienda',
    load: () => import('./Merienda') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Merriweather',
    importName: 'Merriweather',
    load: () => import('./Merriweather') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Merriweather Sans',
    importName: 'MerriweatherSans',
    load: () => import('./MerriweatherSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Metal',
    importName: 'Metal',
    load: () => import('./Metal') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Metal Mania',
    importName: 'MetalMania',
    load: () => import('./MetalMania') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Metamorphous',
    importName: 'Metamorphous',
    load: () => import('./Metamorphous') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Metrophobic',
    importName: 'Metrophobic',
    load: () => import('./Metrophobic') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Michroma',
    importName: 'Michroma',
    load: () => import('./Michroma') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Milonga',
    importName: 'Milonga',
    load: () => import('./Milonga') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Miltonian',
    importName: 'Miltonian',
    load: () => import('./Miltonian') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Miltonian Tattoo',
    importName: 'MiltonianTattoo',
    load: () => import('./MiltonianTattoo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Mina',
    importName: 'Mina',
    load: () => import('./Mina') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Mingzat',
    importName: 'Mingzat',
    load: () => import('./Mingzat') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Miniver',
    importName: 'Miniver',
    load: () => import('./Miniver') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Miriam Libre',
    importName: 'MiriamLibre',
    load: () => import('./MiriamLibre') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Mirza',
    importName: 'Mirza',
    load: () => import('./Mirza') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Miss Fajardose',
    importName: 'MissFajardose',
    load: () => import('./MissFajardose') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Mitr',
    importName: 'Mitr',
    load: () => import('./Mitr') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Mochiy Pop One',
    importName: 'MochiyPopOne',
    load: () => import('./MochiyPopOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Mochiy Pop P One',
    importName: 'MochiyPopPOne',
    load: () => import('./MochiyPopPOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Modak',
    importName: 'Modak',
    load: () => import('./Modak') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Modern Antiqua',
    importName: 'ModernAntiqua',
    load: () => import('./ModernAntiqua') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Mogra',
    importName: 'Mogra',
    load: () => import('./Mogra') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Mohave',
    importName: 'Mohave',
    load: () => import('./Mohave') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Moirai One',
    importName: 'MoiraiOne',
    load: () => import('./MoiraiOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Molengo',
    importName: 'Molengo',
    load: () => import('./Molengo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Molle',
    importName: 'Molle',
    load: () => import('./Molle') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Monda',
    importName: 'Monda',
    load: () => import('./Monda') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Monofett',
    importName: 'Monofett',
    load: () => import('./Monofett') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Monomaniac One',
    importName: 'MonomaniacOne',
    load: () => import('./MonomaniacOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Monoton',
    importName: 'Monoton',
    load: () => import('./Monoton') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Monsieur La Doulaise',
    importName: 'MonsieurLaDoulaise',
    load: () => import('./MonsieurLaDoulaise') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Montaga',
    importName: 'Montaga',
    load: () => import('./Montaga') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Montagu Slab',
    importName: 'MontaguSlab',
    load: () => import('./MontaguSlab') as Promise<FontInfo>,
  },
  {
    fontFamily: 'MonteCarlo',
    importName: 'MonteCarlo',
    load: () => import('./MonteCarlo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Montez',
    importName: 'Montez',
    load: () => import('./Montez') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Montserrat',
    importName: 'Montserrat',
    load: () => import('./Montserrat') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Montserrat Alternates',
    importName: 'MontserratAlternates',
    load: () => import('./MontserratAlternates') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Montserrat Subrayada',
    importName: 'MontserratSubrayada',
    load: () => import('./MontserratSubrayada') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Moo Lah Lah',
    importName: 'MooLahLah',
    load: () => import('./MooLahLah') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Mooli',
    importName: 'Mooli',
    load: () => import('./Mooli') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Moon Dance',
    importName: 'MoonDance',
    load: () => import('./MoonDance') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Moul',
    importName: 'Moul',
    load: () => import('./Moul') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Moulpali',
    importName: 'Moulpali',
    load: () => import('./Moulpali') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Mountains of Christmas',
    importName: 'MountainsofChristmas',
    load: () => import('./MountainsofChristmas') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Mouse Memoirs',
    importName: 'MouseMemoirs',
    load: () => import('./MouseMemoirs') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Mr Bedfort',
    importName: 'MrBedfort',
    load: () => import('./MrBedfort') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Mr Dafoe',
    importName: 'MrDafoe',
    load: () => import('./MrDafoe') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Mr De Haviland',
    importName: 'MrDeHaviland',
    load: () => import('./MrDeHaviland') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Mrs Saint Delafield',
    importName: 'MrsSaintDelafield',
    load: () => import('./MrsSaintDelafield') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Mrs Sheppards',
    importName: 'MrsSheppards',
    load: () => import('./MrsSheppards') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Ms Madi',
    importName: 'MsMadi',
    load: () => import('./MsMadi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Mukta',
    importName: 'Mukta',
    load: () => import('./Mukta') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Mukta Mahee',
    importName: 'MuktaMahee',
    load: () => import('./MuktaMahee') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Mukta Malar',
    importName: 'MuktaMalar',
    load: () => import('./MuktaMalar') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Mukta Vaani',
    importName: 'MuktaVaani',
    load: () => import('./MuktaVaani') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Mulish',
    importName: 'Mulish',
    load: () => import('./Mulish') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Murecho',
    importName: 'Murecho',
    load: () => import('./Murecho') as Promise<FontInfo>,
  },
  {
    fontFamily: 'MuseoModerno',
    importName: 'MuseoModerno',
    load: () => import('./MuseoModerno') as Promise<FontInfo>,
  },
  {
    fontFamily: 'My Soul',
    importName: 'MySoul',
    load: () => import('./MySoul') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Mynerve',
    importName: 'Mynerve',
    load: () => import('./Mynerve') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Mystery Quest',
    importName: 'MysteryQuest',
    load: () => import('./MysteryQuest') as Promise<FontInfo>,
  },
  {
    fontFamily: 'NTR',
    importName: 'NTR',
    load: () => import('./NTR') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Nabla',
    importName: 'Nabla',
    load: () => import('./Nabla') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Nanum Brush Script',
    importName: 'NanumBrushScript',
    load: () => import('./NanumBrushScript') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Nanum Gothic',
    importName: 'NanumGothic',
    load: () => import('./NanumGothic') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Nanum Gothic Coding',
    importName: 'NanumGothicCoding',
    load: () => import('./NanumGothicCoding') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Nanum Myeongjo',
    importName: 'NanumMyeongjo',
    load: () => import('./NanumMyeongjo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Nanum Pen Script',
    importName: 'NanumPenScript',
    load: () => import('./NanumPenScript') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Narnoor',
    importName: 'Narnoor',
    load: () => import('./Narnoor') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Neonderthaw',
    importName: 'Neonderthaw',
    load: () => import('./Neonderthaw') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Nerko One',
    importName: 'NerkoOne',
    load: () => import('./NerkoOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Neucha',
    importName: 'Neucha',
    load: () => import('./Neucha') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Neuton',
    importName: 'Neuton',
    load: () => import('./Neuton') as Promise<FontInfo>,
  },
  {
    fontFamily: 'New Rocker',
    importName: 'NewRocker',
    load: () => import('./NewRocker') as Promise<FontInfo>,
  },
  {
    fontFamily: 'New Tegomin',
    importName: 'NewTegomin',
    load: () => import('./NewTegomin') as Promise<FontInfo>,
  },
  {
    fontFamily: 'News Cycle',
    importName: 'NewsCycle',
    load: () => import('./NewsCycle') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Newsreader',
    importName: 'Newsreader',
    load: () => import('./Newsreader') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Niconne',
    importName: 'Niconne',
    load: () => import('./Niconne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Niramit',
    importName: 'Niramit',
    load: () => import('./Niramit') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Nixie One',
    importName: 'NixieOne',
    load: () => import('./NixieOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Nobile',
    importName: 'Nobile',
    load: () => import('./Nobile') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Nokora',
    importName: 'Nokora',
    load: () => import('./Nokora') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Norican',
    importName: 'Norican',
    load: () => import('./Norican') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Nosifer',
    importName: 'Nosifer',
    load: () => import('./Nosifer') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Notable',
    importName: 'Notable',
    load: () => import('./Notable') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Nothing You Could Do',
    importName: 'NothingYouCouldDo',
    load: () => import('./NothingYouCouldDo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noticia Text',
    importName: 'NoticiaText',
    load: () => import('./NoticiaText') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Color Emoji',
    importName: 'NotoColorEmoji',
    load: () => import('./NotoColorEmoji') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Emoji',
    importName: 'NotoEmoji',
    load: () => import('./NotoEmoji') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Kufi Arabic',
    importName: 'NotoKufiArabic',
    load: () => import('./NotoKufiArabic') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Music',
    importName: 'NotoMusic',
    load: () => import('./NotoMusic') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Naskh Arabic',
    importName: 'NotoNaskhArabic',
    load: () => import('./NotoNaskhArabic') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Nastaliq Urdu',
    importName: 'NotoNastaliqUrdu',
    load: () => import('./NotoNastaliqUrdu') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Rashi Hebrew',
    importName: 'NotoRashiHebrew',
    load: () => import('./NotoRashiHebrew') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans',
    importName: 'NotoSans',
    load: () => import('./NotoSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Adlam',
    importName: 'NotoSansAdlam',
    load: () => import('./NotoSansAdlam') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Adlam Unjoined',
    importName: 'NotoSansAdlamUnjoined',
    load: () => import('./NotoSansAdlamUnjoined') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Anatolian Hieroglyphs',
    importName: 'NotoSansAnatolianHieroglyphs',
    load: () => import('./NotoSansAnatolianHieroglyphs') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Arabic',
    importName: 'NotoSansArabic',
    load: () => import('./NotoSansArabic') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Armenian',
    importName: 'NotoSansArmenian',
    load: () => import('./NotoSansArmenian') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Avestan',
    importName: 'NotoSansAvestan',
    load: () => import('./NotoSansAvestan') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Balinese',
    importName: 'NotoSansBalinese',
    load: () => import('./NotoSansBalinese') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Bamum',
    importName: 'NotoSansBamum',
    load: () => import('./NotoSansBamum') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Bassa Vah',
    importName: 'NotoSansBassaVah',
    load: () => import('./NotoSansBassaVah') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Batak',
    importName: 'NotoSansBatak',
    load: () => import('./NotoSansBatak') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Bengali',
    importName: 'NotoSansBengali',
    load: () => import('./NotoSansBengali') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Bhaiksuki',
    importName: 'NotoSansBhaiksuki',
    load: () => import('./NotoSansBhaiksuki') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Brahmi',
    importName: 'NotoSansBrahmi',
    load: () => import('./NotoSansBrahmi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Buginese',
    importName: 'NotoSansBuginese',
    load: () => import('./NotoSansBuginese') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Buhid',
    importName: 'NotoSansBuhid',
    load: () => import('./NotoSansBuhid') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Canadian Aboriginal',
    importName: 'NotoSansCanadianAboriginal',
    load: () => import('./NotoSansCanadianAboriginal') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Carian',
    importName: 'NotoSansCarian',
    load: () => import('./NotoSansCarian') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Caucasian Albanian',
    importName: 'NotoSansCaucasianAlbanian',
    load: () => import('./NotoSansCaucasianAlbanian') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Chakma',
    importName: 'NotoSansChakma',
    load: () => import('./NotoSansChakma') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Cham',
    importName: 'NotoSansCham',
    load: () => import('./NotoSansCham') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Cherokee',
    importName: 'NotoSansCherokee',
    load: () => import('./NotoSansCherokee') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Chorasmian',
    importName: 'NotoSansChorasmian',
    load: () => import('./NotoSansChorasmian') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Coptic',
    importName: 'NotoSansCoptic',
    load: () => import('./NotoSansCoptic') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Cuneiform',
    importName: 'NotoSansCuneiform',
    load: () => import('./NotoSansCuneiform') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Cypriot',
    importName: 'NotoSansCypriot',
    load: () => import('./NotoSansCypriot') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Cypro Minoan',
    importName: 'NotoSansCyproMinoan',
    load: () => import('./NotoSansCyproMinoan') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Deseret',
    importName: 'NotoSansDeseret',
    load: () => import('./NotoSansDeseret') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Devanagari',
    importName: 'NotoSansDevanagari',
    load: () => import('./NotoSansDevanagari') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Display',
    importName: 'NotoSansDisplay',
    load: () => import('./NotoSansDisplay') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Duployan',
    importName: 'NotoSansDuployan',
    load: () => import('./NotoSansDuployan') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Egyptian Hieroglyphs',
    importName: 'NotoSansEgyptianHieroglyphs',
    load: () => import('./NotoSansEgyptianHieroglyphs') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Elbasan',
    importName: 'NotoSansElbasan',
    load: () => import('./NotoSansElbasan') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Elymaic',
    importName: 'NotoSansElymaic',
    load: () => import('./NotoSansElymaic') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Ethiopic',
    importName: 'NotoSansEthiopic',
    load: () => import('./NotoSansEthiopic') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Georgian',
    importName: 'NotoSansGeorgian',
    load: () => import('./NotoSansGeorgian') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Glagolitic',
    importName: 'NotoSansGlagolitic',
    load: () => import('./NotoSansGlagolitic') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Gothic',
    importName: 'NotoSansGothic',
    load: () => import('./NotoSansGothic') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Grantha',
    importName: 'NotoSansGrantha',
    load: () => import('./NotoSansGrantha') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Gujarati',
    importName: 'NotoSansGujarati',
    load: () => import('./NotoSansGujarati') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Gunjala Gondi',
    importName: 'NotoSansGunjalaGondi',
    load: () => import('./NotoSansGunjalaGondi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Gurmukhi',
    importName: 'NotoSansGurmukhi',
    load: () => import('./NotoSansGurmukhi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans HK',
    importName: 'NotoSansHK',
    load: () => import('./NotoSansHK') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Hanifi Rohingya',
    importName: 'NotoSansHanifiRohingya',
    load: () => import('./NotoSansHanifiRohingya') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Hanunoo',
    importName: 'NotoSansHanunoo',
    load: () => import('./NotoSansHanunoo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Hatran',
    importName: 'NotoSansHatran',
    load: () => import('./NotoSansHatran') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Hebrew',
    importName: 'NotoSansHebrew',
    load: () => import('./NotoSansHebrew') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Imperial Aramaic',
    importName: 'NotoSansImperialAramaic',
    load: () => import('./NotoSansImperialAramaic') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Indic Siyaq Numbers',
    importName: 'NotoSansIndicSiyaqNumbers',
    load: () => import('./NotoSansIndicSiyaqNumbers') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Inscriptional Pahlavi',
    importName: 'NotoSansInscriptionalPahlavi',
    load: () => import('./NotoSansInscriptionalPahlavi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Inscriptional Parthian',
    importName: 'NotoSansInscriptionalParthian',
    load: () => import('./NotoSansInscriptionalParthian') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans JP',
    importName: 'NotoSansJP',
    load: () => import('./NotoSansJP') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Javanese',
    importName: 'NotoSansJavanese',
    load: () => import('./NotoSansJavanese') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans KR',
    importName: 'NotoSansKR',
    load: () => import('./NotoSansKR') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Kaithi',
    importName: 'NotoSansKaithi',
    load: () => import('./NotoSansKaithi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Kannada',
    importName: 'NotoSansKannada',
    load: () => import('./NotoSansKannada') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Kawi',
    importName: 'NotoSansKawi',
    load: () => import('./NotoSansKawi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Kayah Li',
    importName: 'NotoSansKayahLi',
    load: () => import('./NotoSansKayahLi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Kharoshthi',
    importName: 'NotoSansKharoshthi',
    load: () => import('./NotoSansKharoshthi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Khmer',
    importName: 'NotoSansKhmer',
    load: () => import('./NotoSansKhmer') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Khojki',
    importName: 'NotoSansKhojki',
    load: () => import('./NotoSansKhojki') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Khudawadi',
    importName: 'NotoSansKhudawadi',
    load: () => import('./NotoSansKhudawadi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Lao',
    importName: 'NotoSansLao',
    load: () => import('./NotoSansLao') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Lao Looped',
    importName: 'NotoSansLaoLooped',
    load: () => import('./NotoSansLaoLooped') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Lepcha',
    importName: 'NotoSansLepcha',
    load: () => import('./NotoSansLepcha') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Limbu',
    importName: 'NotoSansLimbu',
    load: () => import('./NotoSansLimbu') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Linear A',
    importName: 'NotoSansLinearA',
    load: () => import('./NotoSansLinearA') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Linear B',
    importName: 'NotoSansLinearB',
    load: () => import('./NotoSansLinearB') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Lisu',
    importName: 'NotoSansLisu',
    load: () => import('./NotoSansLisu') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Lycian',
    importName: 'NotoSansLycian',
    load: () => import('./NotoSansLycian') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Lydian',
    importName: 'NotoSansLydian',
    load: () => import('./NotoSansLydian') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Mahajani',
    importName: 'NotoSansMahajani',
    load: () => import('./NotoSansMahajani') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Malayalam',
    importName: 'NotoSansMalayalam',
    load: () => import('./NotoSansMalayalam') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Mandaic',
    importName: 'NotoSansMandaic',
    load: () => import('./NotoSansMandaic') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Manichaean',
    importName: 'NotoSansManichaean',
    load: () => import('./NotoSansManichaean') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Marchen',
    importName: 'NotoSansMarchen',
    load: () => import('./NotoSansMarchen') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Masaram Gondi',
    importName: 'NotoSansMasaramGondi',
    load: () => import('./NotoSansMasaramGondi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Math',
    importName: 'NotoSansMath',
    load: () => import('./NotoSansMath') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Mayan Numerals',
    importName: 'NotoSansMayanNumerals',
    load: () => import('./NotoSansMayanNumerals') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Medefaidrin',
    importName: 'NotoSansMedefaidrin',
    load: () => import('./NotoSansMedefaidrin') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Meetei Mayek',
    importName: 'NotoSansMeeteiMayek',
    load: () => import('./NotoSansMeeteiMayek') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Mende Kikakui',
    importName: 'NotoSansMendeKikakui',
    load: () => import('./NotoSansMendeKikakui') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Meroitic',
    importName: 'NotoSansMeroitic',
    load: () => import('./NotoSansMeroitic') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Miao',
    importName: 'NotoSansMiao',
    load: () => import('./NotoSansMiao') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Modi',
    importName: 'NotoSansModi',
    load: () => import('./NotoSansModi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Mongolian',
    importName: 'NotoSansMongolian',
    load: () => import('./NotoSansMongolian') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Mono',
    importName: 'NotoSansMono',
    load: () => import('./NotoSansMono') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Mro',
    importName: 'NotoSansMro',
    load: () => import('./NotoSansMro') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Multani',
    importName: 'NotoSansMultani',
    load: () => import('./NotoSansMultani') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Myanmar',
    importName: 'NotoSansMyanmar',
    load: () => import('./NotoSansMyanmar') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans NKo',
    importName: 'NotoSansNKo',
    load: () => import('./NotoSansNKo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans NKo Unjoined',
    importName: 'NotoSansNKoUnjoined',
    load: () => import('./NotoSansNKoUnjoined') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Nabataean',
    importName: 'NotoSansNabataean',
    load: () => import('./NotoSansNabataean') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Nag Mundari',
    importName: 'NotoSansNagMundari',
    load: () => import('./NotoSansNagMundari') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Nandinagari',
    importName: 'NotoSansNandinagari',
    load: () => import('./NotoSansNandinagari') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans New Tai Lue',
    importName: 'NotoSansNewTaiLue',
    load: () => import('./NotoSansNewTaiLue') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Newa',
    importName: 'NotoSansNewa',
    load: () => import('./NotoSansNewa') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Nushu',
    importName: 'NotoSansNushu',
    load: () => import('./NotoSansNushu') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Ogham',
    importName: 'NotoSansOgham',
    load: () => import('./NotoSansOgham') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Ol Chiki',
    importName: 'NotoSansOlChiki',
    load: () => import('./NotoSansOlChiki') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Old Hungarian',
    importName: 'NotoSansOldHungarian',
    load: () => import('./NotoSansOldHungarian') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Old Italic',
    importName: 'NotoSansOldItalic',
    load: () => import('./NotoSansOldItalic') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Old North Arabian',
    importName: 'NotoSansOldNorthArabian',
    load: () => import('./NotoSansOldNorthArabian') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Old Permic',
    importName: 'NotoSansOldPermic',
    load: () => import('./NotoSansOldPermic') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Old Persian',
    importName: 'NotoSansOldPersian',
    load: () => import('./NotoSansOldPersian') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Old Sogdian',
    importName: 'NotoSansOldSogdian',
    load: () => import('./NotoSansOldSogdian') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Old South Arabian',
    importName: 'NotoSansOldSouthArabian',
    load: () => import('./NotoSansOldSouthArabian') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Old Turkic',
    importName: 'NotoSansOldTurkic',
    load: () => import('./NotoSansOldTurkic') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Oriya',
    importName: 'NotoSansOriya',
    load: () => import('./NotoSansOriya') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Osage',
    importName: 'NotoSansOsage',
    load: () => import('./NotoSansOsage') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Osmanya',
    importName: 'NotoSansOsmanya',
    load: () => import('./NotoSansOsmanya') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Pahawh Hmong',
    importName: 'NotoSansPahawhHmong',
    load: () => import('./NotoSansPahawhHmong') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Palmyrene',
    importName: 'NotoSansPalmyrene',
    load: () => import('./NotoSansPalmyrene') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Pau Cin Hau',
    importName: 'NotoSansPauCinHau',
    load: () => import('./NotoSansPauCinHau') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Phags Pa',
    importName: 'NotoSansPhagsPa',
    load: () => import('./NotoSansPhagsPa') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Phoenician',
    importName: 'NotoSansPhoenician',
    load: () => import('./NotoSansPhoenician') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Psalter Pahlavi',
    importName: 'NotoSansPsalterPahlavi',
    load: () => import('./NotoSansPsalterPahlavi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Rejang',
    importName: 'NotoSansRejang',
    load: () => import('./NotoSansRejang') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Runic',
    importName: 'NotoSansRunic',
    load: () => import('./NotoSansRunic') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans SC',
    importName: 'NotoSansSC',
    load: () => import('./NotoSansSC') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Samaritan',
    importName: 'NotoSansSamaritan',
    load: () => import('./NotoSansSamaritan') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Saurashtra',
    importName: 'NotoSansSaurashtra',
    load: () => import('./NotoSansSaurashtra') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Sharada',
    importName: 'NotoSansSharada',
    load: () => import('./NotoSansSharada') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Shavian',
    importName: 'NotoSansShavian',
    load: () => import('./NotoSansShavian') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Siddham',
    importName: 'NotoSansSiddham',
    load: () => import('./NotoSansSiddham') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans SignWriting',
    importName: 'NotoSansSignWriting',
    load: () => import('./NotoSansSignWriting') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Sinhala',
    importName: 'NotoSansSinhala',
    load: () => import('./NotoSansSinhala') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Sogdian',
    importName: 'NotoSansSogdian',
    load: () => import('./NotoSansSogdian') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Sora Sompeng',
    importName: 'NotoSansSoraSompeng',
    load: () => import('./NotoSansSoraSompeng') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Soyombo',
    importName: 'NotoSansSoyombo',
    load: () => import('./NotoSansSoyombo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Sundanese',
    importName: 'NotoSansSundanese',
    load: () => import('./NotoSansSundanese') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Syloti Nagri',
    importName: 'NotoSansSylotiNagri',
    load: () => import('./NotoSansSylotiNagri') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Symbols',
    importName: 'NotoSansSymbols',
    load: () => import('./NotoSansSymbols') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Symbols 2',
    importName: 'NotoSansSymbols2',
    load: () => import('./NotoSansSymbols2') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Syriac',
    importName: 'NotoSansSyriac',
    load: () => import('./NotoSansSyriac') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Syriac Eastern',
    importName: 'NotoSansSyriacEastern',
    load: () => import('./NotoSansSyriacEastern') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans TC',
    importName: 'NotoSansTC',
    load: () => import('./NotoSansTC') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Tagalog',
    importName: 'NotoSansTagalog',
    load: () => import('./NotoSansTagalog') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Tagbanwa',
    importName: 'NotoSansTagbanwa',
    load: () => import('./NotoSansTagbanwa') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Tai Le',
    importName: 'NotoSansTaiLe',
    load: () => import('./NotoSansTaiLe') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Tai Tham',
    importName: 'NotoSansTaiTham',
    load: () => import('./NotoSansTaiTham') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Tai Viet',
    importName: 'NotoSansTaiViet',
    load: () => import('./NotoSansTaiViet') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Takri',
    importName: 'NotoSansTakri',
    load: () => import('./NotoSansTakri') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Tamil',
    importName: 'NotoSansTamil',
    load: () => import('./NotoSansTamil') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Tamil Supplement',
    importName: 'NotoSansTamilSupplement',
    load: () => import('./NotoSansTamilSupplement') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Tangsa',
    importName: 'NotoSansTangsa',
    load: () => import('./NotoSansTangsa') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Telugu',
    importName: 'NotoSansTelugu',
    load: () => import('./NotoSansTelugu') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Thaana',
    importName: 'NotoSansThaana',
    load: () => import('./NotoSansThaana') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Thai',
    importName: 'NotoSansThai',
    load: () => import('./NotoSansThai') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Thai Looped',
    importName: 'NotoSansThaiLooped',
    load: () => import('./NotoSansThaiLooped') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Tifinagh',
    importName: 'NotoSansTifinagh',
    load: () => import('./NotoSansTifinagh') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Tirhuta',
    importName: 'NotoSansTirhuta',
    load: () => import('./NotoSansTirhuta') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Ugaritic',
    importName: 'NotoSansUgaritic',
    load: () => import('./NotoSansUgaritic') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Vai',
    importName: 'NotoSansVai',
    load: () => import('./NotoSansVai') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Vithkuqi',
    importName: 'NotoSansVithkuqi',
    load: () => import('./NotoSansVithkuqi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Wancho',
    importName: 'NotoSansWancho',
    load: () => import('./NotoSansWancho') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Warang Citi',
    importName: 'NotoSansWarangCiti',
    load: () => import('./NotoSansWarangCiti') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Yi',
    importName: 'NotoSansYi',
    load: () => import('./NotoSansYi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Sans Zanabazar Square',
    importName: 'NotoSansZanabazarSquare',
    load: () => import('./NotoSansZanabazarSquare') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif',
    importName: 'NotoSerif',
    load: () => import('./NotoSerif') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif Ahom',
    importName: 'NotoSerifAhom',
    load: () => import('./NotoSerifAhom') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif Armenian',
    importName: 'NotoSerifArmenian',
    load: () => import('./NotoSerifArmenian') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif Balinese',
    importName: 'NotoSerifBalinese',
    load: () => import('./NotoSerifBalinese') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif Bengali',
    importName: 'NotoSerifBengali',
    load: () => import('./NotoSerifBengali') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif Devanagari',
    importName: 'NotoSerifDevanagari',
    load: () => import('./NotoSerifDevanagari') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif Display',
    importName: 'NotoSerifDisplay',
    load: () => import('./NotoSerifDisplay') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif Dogra',
    importName: 'NotoSerifDogra',
    load: () => import('./NotoSerifDogra') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif Ethiopic',
    importName: 'NotoSerifEthiopic',
    load: () => import('./NotoSerifEthiopic') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif Georgian',
    importName: 'NotoSerifGeorgian',
    load: () => import('./NotoSerifGeorgian') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif Grantha',
    importName: 'NotoSerifGrantha',
    load: () => import('./NotoSerifGrantha') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif Gujarati',
    importName: 'NotoSerifGujarati',
    load: () => import('./NotoSerifGujarati') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif Gurmukhi',
    importName: 'NotoSerifGurmukhi',
    load: () => import('./NotoSerifGurmukhi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif HK',
    importName: 'NotoSerifHK',
    load: () => import('./NotoSerifHK') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif Hebrew',
    importName: 'NotoSerifHebrew',
    load: () => import('./NotoSerifHebrew') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif JP',
    importName: 'NotoSerifJP',
    load: () => import('./NotoSerifJP') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif KR',
    importName: 'NotoSerifKR',
    load: () => import('./NotoSerifKR') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif Kannada',
    importName: 'NotoSerifKannada',
    load: () => import('./NotoSerifKannada') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif Khitan Small Script',
    importName: 'NotoSerifKhitanSmallScript',
    load: () => import('./NotoSerifKhitanSmallScript') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif Khmer',
    importName: 'NotoSerifKhmer',
    load: () => import('./NotoSerifKhmer') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif Khojki',
    importName: 'NotoSerifKhojki',
    load: () => import('./NotoSerifKhojki') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif Lao',
    importName: 'NotoSerifLao',
    load: () => import('./NotoSerifLao') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif Makasar',
    importName: 'NotoSerifMakasar',
    load: () => import('./NotoSerifMakasar') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif Malayalam',
    importName: 'NotoSerifMalayalam',
    load: () => import('./NotoSerifMalayalam') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif Myanmar',
    importName: 'NotoSerifMyanmar',
    load: () => import('./NotoSerifMyanmar') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif NP Hmong',
    importName: 'NotoSerifNPHmong',
    load: () => import('./NotoSerifNPHmong') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif Old Uyghur',
    importName: 'NotoSerifOldUyghur',
    load: () => import('./NotoSerifOldUyghur') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif Oriya',
    importName: 'NotoSerifOriya',
    load: () => import('./NotoSerifOriya') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif Ottoman Siyaq',
    importName: 'NotoSerifOttomanSiyaq',
    load: () => import('./NotoSerifOttomanSiyaq') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif SC',
    importName: 'NotoSerifSC',
    load: () => import('./NotoSerifSC') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif Sinhala',
    importName: 'NotoSerifSinhala',
    load: () => import('./NotoSerifSinhala') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif TC',
    importName: 'NotoSerifTC',
    load: () => import('./NotoSerifTC') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif Tamil',
    importName: 'NotoSerifTamil',
    load: () => import('./NotoSerifTamil') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif Tangut',
    importName: 'NotoSerifTangut',
    load: () => import('./NotoSerifTangut') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif Telugu',
    importName: 'NotoSerifTelugu',
    load: () => import('./NotoSerifTelugu') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif Thai',
    importName: 'NotoSerifThai',
    load: () => import('./NotoSerifThai') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif Tibetan',
    importName: 'NotoSerifTibetan',
    load: () => import('./NotoSerifTibetan') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif Toto',
    importName: 'NotoSerifToto',
    load: () => import('./NotoSerifToto') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif Vithkuqi',
    importName: 'NotoSerifVithkuqi',
    load: () => import('./NotoSerifVithkuqi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Serif Yezidi',
    importName: 'NotoSerifYezidi',
    load: () => import('./NotoSerifYezidi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Noto Traditional Nushu',
    importName: 'NotoTraditionalNushu',
    load: () => import('./NotoTraditionalNushu') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Nova Cut',
    importName: 'NovaCut',
    load: () => import('./NovaCut') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Nova Flat',
    importName: 'NovaFlat',
    load: () => import('./NovaFlat') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Nova Mono',
    importName: 'NovaMono',
    load: () => import('./NovaMono') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Nova Oval',
    importName: 'NovaOval',
    load: () => import('./NovaOval') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Nova Round',
    importName: 'NovaRound',
    load: () => import('./NovaRound') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Nova Script',
    importName: 'NovaScript',
    load: () => import('./NovaScript') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Nova Slim',
    importName: 'NovaSlim',
    load: () => import('./NovaSlim') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Nova Square',
    importName: 'NovaSquare',
    load: () => import('./NovaSquare') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Numans',
    importName: 'Numans',
    load: () => import('./Numans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Nunito',
    importName: 'Nunito',
    load: () => import('./Nunito') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Nunito Sans',
    importName: 'NunitoSans',
    load: () => import('./NunitoSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Nuosu SIL',
    importName: 'NuosuSIL',
    load: () => import('./NuosuSIL') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Odibee Sans',
    importName: 'OdibeeSans',
    load: () => import('./OdibeeSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Odor Mean Chey',
    importName: 'OdorMeanChey',
    load: () => import('./OdorMeanChey') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Offside',
    importName: 'Offside',
    load: () => import('./Offside') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Oi',
    importName: 'Oi',
    load: () => import('./Oi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Old Standard TT',
    importName: 'OldStandardTT',
    load: () => import('./OldStandardTT') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Oldenburg',
    importName: 'Oldenburg',
    load: () => import('./Oldenburg') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Ole',
    importName: 'Ole',
    load: () => import('./Ole') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Oleo Script',
    importName: 'OleoScript',
    load: () => import('./OleoScript') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Oleo Script Swash Caps',
    importName: 'OleoScriptSwashCaps',
    load: () => import('./OleoScriptSwashCaps') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Onest',
    importName: 'Onest',
    load: () => import('./Onest') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Oooh Baby',
    importName: 'OoohBaby',
    load: () => import('./OoohBaby') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Open Sans',
    importName: 'OpenSans',
    load: () => import('./OpenSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Oranienbaum',
    importName: 'Oranienbaum',
    load: () => import('./Oranienbaum') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Orbit',
    importName: 'Orbit',
    load: () => import('./Orbit') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Orbitron',
    importName: 'Orbitron',
    load: () => import('./Orbitron') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Oregano',
    importName: 'Oregano',
    load: () => import('./Oregano') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Orelega One',
    importName: 'OrelegaOne',
    load: () => import('./OrelegaOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Orienta',
    importName: 'Orienta',
    load: () => import('./Orienta') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Original Surfer',
    importName: 'OriginalSurfer',
    load: () => import('./OriginalSurfer') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Oswald',
    importName: 'Oswald',
    load: () => import('./Oswald') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Outfit',
    importName: 'Outfit',
    load: () => import('./Outfit') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Over the Rainbow',
    importName: 'OvertheRainbow',
    load: () => import('./OvertheRainbow') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Overlock',
    importName: 'Overlock',
    load: () => import('./Overlock') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Overlock SC',
    importName: 'OverlockSC',
    load: () => import('./OverlockSC') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Overpass',
    importName: 'Overpass',
    load: () => import('./Overpass') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Overpass Mono',
    importName: 'OverpassMono',
    load: () => import('./OverpassMono') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Ovo',
    importName: 'Ovo',
    load: () => import('./Ovo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Oxanium',
    importName: 'Oxanium',
    load: () => import('./Oxanium') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Oxygen',
    importName: 'Oxygen',
    load: () => import('./Oxygen') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Oxygen Mono',
    importName: 'OxygenMono',
    load: () => import('./OxygenMono') as Promise<FontInfo>,
  },
  {
    fontFamily: 'PT Mono',
    importName: 'PTMono',
    load: () => import('./PTMono') as Promise<FontInfo>,
  },
  {
    fontFamily: 'PT Sans',
    importName: 'PTSans',
    load: () => import('./PTSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'PT Sans Caption',
    importName: 'PTSansCaption',
    load: () => import('./PTSansCaption') as Promise<FontInfo>,
  },
  {
    fontFamily: 'PT Sans Narrow',
    importName: 'PTSansNarrow',
    load: () => import('./PTSansNarrow') as Promise<FontInfo>,
  },
  {
    fontFamily: 'PT Serif',
    importName: 'PTSerif',
    load: () => import('./PTSerif') as Promise<FontInfo>,
  },
  {
    fontFamily: 'PT Serif Caption',
    importName: 'PTSerifCaption',
    load: () => import('./PTSerifCaption') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Pacifico',
    importName: 'Pacifico',
    load: () => import('./Pacifico') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Padauk',
    importName: 'Padauk',
    load: () => import('./Padauk') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Padyakke Expanded One',
    importName: 'PadyakkeExpandedOne',
    load: () => import('./PadyakkeExpandedOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Palanquin',
    importName: 'Palanquin',
    load: () => import('./Palanquin') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Palanquin Dark',
    importName: 'PalanquinDark',
    load: () => import('./PalanquinDark') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Palette Mosaic',
    importName: 'PaletteMosaic',
    load: () => import('./PaletteMosaic') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Pangolin',
    importName: 'Pangolin',
    load: () => import('./Pangolin') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Paprika',
    importName: 'Paprika',
    load: () => import('./Paprika') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Parisienne',
    importName: 'Parisienne',
    load: () => import('./Parisienne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Passero One',
    importName: 'PasseroOne',
    load: () => import('./PasseroOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Passion One',
    importName: 'PassionOne',
    load: () => import('./PassionOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Passions Conflict',
    importName: 'PassionsConflict',
    load: () => import('./PassionsConflict') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Pathway Extreme',
    importName: 'PathwayExtreme',
    load: () => import('./PathwayExtreme') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Pathway Gothic One',
    importName: 'PathwayGothicOne',
    load: () => import('./PathwayGothicOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Patrick Hand',
    importName: 'PatrickHand',
    load: () => import('./PatrickHand') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Patrick Hand SC',
    importName: 'PatrickHandSC',
    load: () => import('./PatrickHandSC') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Pattaya',
    importName: 'Pattaya',
    load: () => import('./Pattaya') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Patua One',
    importName: 'PatuaOne',
    load: () => import('./PatuaOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Pavanam',
    importName: 'Pavanam',
    load: () => import('./Pavanam') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Paytone One',
    importName: 'PaytoneOne',
    load: () => import('./PaytoneOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Peddana',
    importName: 'Peddana',
    load: () => import('./Peddana') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Peralta',
    importName: 'Peralta',
    load: () => import('./Peralta') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Permanent Marker',
    importName: 'PermanentMarker',
    load: () => import('./PermanentMarker') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Petemoss',
    importName: 'Petemoss',
    load: () => import('./Petemoss') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Petit Formal Script',
    importName: 'PetitFormalScript',
    load: () => import('./PetitFormalScript') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Petrona',
    importName: 'Petrona',
    load: () => import('./Petrona') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Philosopher',
    importName: 'Philosopher',
    load: () => import('./Philosopher') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Phudu',
    importName: 'Phudu',
    load: () => import('./Phudu') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Piazzolla',
    importName: 'Piazzolla',
    load: () => import('./Piazzolla') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Piedra',
    importName: 'Piedra',
    load: () => import('./Piedra') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Pinyon Script',
    importName: 'PinyonScript',
    load: () => import('./PinyonScript') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Pirata One',
    importName: 'PirataOne',
    load: () => import('./PirataOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Pixelify Sans',
    importName: 'PixelifySans',
    load: () => import('./PixelifySans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Plaster',
    importName: 'Plaster',
    load: () => import('./Plaster') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Play',
    importName: 'Play',
    load: () => import('./Play') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Playball',
    importName: 'Playball',
    load: () => import('./Playball') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Playfair',
    importName: 'Playfair',
    load: () => import('./Playfair') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Playfair Display',
    importName: 'PlayfairDisplay',
    load: () => import('./PlayfairDisplay') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Playfair Display SC',
    importName: 'PlayfairDisplaySC',
    load: () => import('./PlayfairDisplaySC') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Playpen Sans',
    importName: 'PlaypenSans',
    load: () => import('./PlaypenSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Plus Jakarta Sans',
    importName: 'PlusJakartaSans',
    load: () => import('./PlusJakartaSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Podkova',
    importName: 'Podkova',
    load: () => import('./Podkova') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Poiret One',
    importName: 'PoiretOne',
    load: () => import('./PoiretOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Poller One',
    importName: 'PollerOne',
    load: () => import('./PollerOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Poltawski Nowy',
    importName: 'PoltawskiNowy',
    load: () => import('./PoltawskiNowy') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Poly',
    importName: 'Poly',
    load: () => import('./Poly') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Pompiere',
    importName: 'Pompiere',
    load: () => import('./Pompiere') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Pontano Sans',
    importName: 'PontanoSans',
    load: () => import('./PontanoSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Poor Story',
    importName: 'PoorStory',
    load: () => import('./PoorStory') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Poppins',
    importName: 'Poppins',
    load: () => import('./Poppins') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Port Lligat Sans',
    importName: 'PortLligatSans',
    load: () => import('./PortLligatSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Port Lligat Slab',
    importName: 'PortLligatSlab',
    load: () => import('./PortLligatSlab') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Potta One',
    importName: 'PottaOne',
    load: () => import('./PottaOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Pragati Narrow',
    importName: 'PragatiNarrow',
    load: () => import('./PragatiNarrow') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Praise',
    importName: 'Praise',
    load: () => import('./Praise') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Prata',
    importName: 'Prata',
    load: () => import('./Prata') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Preahvihear',
    importName: 'Preahvihear',
    load: () => import('./Preahvihear') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Press Start 2P',
    importName: 'PressStart2P',
    load: () => import('./PressStart2P') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Pridi',
    importName: 'Pridi',
    load: () => import('./Pridi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Princess Sofia',
    importName: 'PrincessSofia',
    load: () => import('./PrincessSofia') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Prociono',
    importName: 'Prociono',
    load: () => import('./Prociono') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Prompt',
    importName: 'Prompt',
    load: () => import('./Prompt') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Prosto One',
    importName: 'ProstoOne',
    load: () => import('./ProstoOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Proza Libre',
    importName: 'ProzaLibre',
    load: () => import('./ProzaLibre') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Public Sans',
    importName: 'PublicSans',
    load: () => import('./PublicSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Puppies Play',
    importName: 'PuppiesPlay',
    load: () => import('./PuppiesPlay') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Puritan',
    importName: 'Puritan',
    load: () => import('./Puritan') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Purple Purse',
    importName: 'PurplePurse',
    load: () => import('./PurplePurse') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Qahiri',
    importName: 'Qahiri',
    load: () => import('./Qahiri') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Quando',
    importName: 'Quando',
    load: () => import('./Quando') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Quantico',
    importName: 'Quantico',
    load: () => import('./Quantico') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Quattrocento',
    importName: 'Quattrocento',
    load: () => import('./Quattrocento') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Quattrocento Sans',
    importName: 'QuattrocentoSans',
    load: () => import('./QuattrocentoSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Questrial',
    importName: 'Questrial',
    load: () => import('./Questrial') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Quicksand',
    importName: 'Quicksand',
    load: () => import('./Quicksand') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Quintessential',
    importName: 'Quintessential',
    load: () => import('./Quintessential') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Qwigley',
    importName: 'Qwigley',
    load: () => import('./Qwigley') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Qwitcher Grypen',
    importName: 'QwitcherGrypen',
    load: () => import('./QwitcherGrypen') as Promise<FontInfo>,
  },
  {
    fontFamily: 'REM',
    importName: 'REM',
    load: () => import('./REM') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Racing Sans One',
    importName: 'RacingSansOne',
    load: () => import('./RacingSansOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Radio Canada',
    importName: 'RadioCanada',
    load: () => import('./RadioCanada') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Radley',
    importName: 'Radley',
    load: () => import('./Radley') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rajdhani',
    importName: 'Rajdhani',
    load: () => import('./Rajdhani') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rakkas',
    importName: 'Rakkas',
    load: () => import('./Rakkas') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Raleway',
    importName: 'Raleway',
    load: () => import('./Raleway') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Raleway Dots',
    importName: 'RalewayDots',
    load: () => import('./RalewayDots') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Ramabhadra',
    importName: 'Ramabhadra',
    load: () => import('./Ramabhadra') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Ramaraja',
    importName: 'Ramaraja',
    load: () => import('./Ramaraja') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rambla',
    importName: 'Rambla',
    load: () => import('./Rambla') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rammetto One',
    importName: 'RammettoOne',
    load: () => import('./RammettoOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rampart One',
    importName: 'RampartOne',
    load: () => import('./RampartOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Ranchers',
    importName: 'Ranchers',
    load: () => import('./Ranchers') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rancho',
    importName: 'Rancho',
    load: () => import('./Rancho') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Ranga',
    importName: 'Ranga',
    load: () => import('./Ranga') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rasa',
    importName: 'Rasa',
    load: () => import('./Rasa') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rationale',
    importName: 'Rationale',
    load: () => import('./Rationale') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Ravi Prakash',
    importName: 'RaviPrakash',
    load: () => import('./RaviPrakash') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Readex Pro',
    importName: 'ReadexPro',
    load: () => import('./ReadexPro') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Recursive',
    importName: 'Recursive',
    load: () => import('./Recursive') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Red Hat Display',
    importName: 'RedHatDisplay',
    load: () => import('./RedHatDisplay') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Red Hat Mono',
    importName: 'RedHatMono',
    load: () => import('./RedHatMono') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Red Hat Text',
    importName: 'RedHatText',
    load: () => import('./RedHatText') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Red Rose',
    importName: 'RedRose',
    load: () => import('./RedRose') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Redacted',
    importName: 'Redacted',
    load: () => import('./Redacted') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Redacted Script',
    importName: 'RedactedScript',
    load: () => import('./RedactedScript') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Redressed',
    importName: 'Redressed',
    load: () => import('./Redressed') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Reem Kufi',
    importName: 'ReemKufi',
    load: () => import('./ReemKufi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Reem Kufi Fun',
    importName: 'ReemKufiFun',
    load: () => import('./ReemKufiFun') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Reem Kufi Ink',
    importName: 'ReemKufiInk',
    load: () => import('./ReemKufiInk') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Reenie Beanie',
    importName: 'ReenieBeanie',
    load: () => import('./ReenieBeanie') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Reggae One',
    importName: 'ReggaeOne',
    load: () => import('./ReggaeOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Revalia',
    importName: 'Revalia',
    load: () => import('./Revalia') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rhodium Libre',
    importName: 'RhodiumLibre',
    load: () => import('./RhodiumLibre') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Ribeye',
    importName: 'Ribeye',
    load: () => import('./Ribeye') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Ribeye Marrow',
    importName: 'RibeyeMarrow',
    load: () => import('./RibeyeMarrow') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Righteous',
    importName: 'Righteous',
    load: () => import('./Righteous') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Risque',
    importName: 'Risque',
    load: () => import('./Risque') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Road Rage',
    importName: 'RoadRage',
    load: () => import('./RoadRage') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Roboto',
    importName: 'Roboto',
    load: () => import('./Roboto') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Roboto Condensed',
    importName: 'RobotoCondensed',
    load: () => import('./RobotoCondensed') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Roboto Flex',
    importName: 'RobotoFlex',
    load: () => import('./RobotoFlex') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Roboto Mono',
    importName: 'RobotoMono',
    load: () => import('./RobotoMono') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Roboto Serif',
    importName: 'RobotoSerif',
    load: () => import('./RobotoSerif') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Roboto Slab',
    importName: 'RobotoSlab',
    load: () => import('./RobotoSlab') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rochester',
    importName: 'Rochester',
    load: () => import('./Rochester') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rock 3D',
    importName: 'Rock3D',
    load: () => import('./Rock3D') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rock Salt',
    importName: 'RockSalt',
    load: () => import('./RockSalt') as Promise<FontInfo>,
  },
  {
    fontFamily: 'RocknRoll One',
    importName: 'RocknRollOne',
    load: () => import('./RocknRollOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rokkitt',
    importName: 'Rokkitt',
    load: () => import('./Rokkitt') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Romanesco',
    importName: 'Romanesco',
    load: () => import('./Romanesco') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Ropa Sans',
    importName: 'RopaSans',
    load: () => import('./RopaSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rosario',
    importName: 'Rosario',
    load: () => import('./Rosario') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rosarivo',
    importName: 'Rosarivo',
    load: () => import('./Rosarivo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rouge Script',
    importName: 'RougeScript',
    load: () => import('./RougeScript') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rowdies',
    importName: 'Rowdies',
    load: () => import('./Rowdies') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rozha One',
    importName: 'RozhaOne',
    load: () => import('./RozhaOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rubik',
    importName: 'Rubik',
    load: () => import('./Rubik') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rubik 80s Fade',
    importName: 'Rubik80sFade',
    load: () => import('./Rubik80sFade') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rubik Beastly',
    importName: 'RubikBeastly',
    load: () => import('./RubikBeastly') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rubik Bubbles',
    importName: 'RubikBubbles',
    load: () => import('./RubikBubbles') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rubik Burned',
    importName: 'RubikBurned',
    load: () => import('./RubikBurned') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rubik Dirt',
    importName: 'RubikDirt',
    load: () => import('./RubikDirt') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rubik Distressed',
    importName: 'RubikDistressed',
    load: () => import('./RubikDistressed') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rubik Gemstones',
    importName: 'RubikGemstones',
    load: () => import('./RubikGemstones') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rubik Glitch',
    importName: 'RubikGlitch',
    load: () => import('./RubikGlitch') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rubik Iso',
    importName: 'RubikIso',
    load: () => import('./RubikIso') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rubik Marker Hatch',
    importName: 'RubikMarkerHatch',
    load: () => import('./RubikMarkerHatch') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rubik Maze',
    importName: 'RubikMaze',
    load: () => import('./RubikMaze') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rubik Microbe',
    importName: 'RubikMicrobe',
    load: () => import('./RubikMicrobe') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rubik Mono One',
    importName: 'RubikMonoOne',
    load: () => import('./RubikMonoOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rubik Moonrocks',
    importName: 'RubikMoonrocks',
    load: () => import('./RubikMoonrocks') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rubik Pixels',
    importName: 'RubikPixels',
    load: () => import('./RubikPixels') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rubik Puddles',
    importName: 'RubikPuddles',
    load: () => import('./RubikPuddles') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rubik Spray Paint',
    importName: 'RubikSprayPaint',
    load: () => import('./RubikSprayPaint') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rubik Storm',
    importName: 'RubikStorm',
    load: () => import('./RubikStorm') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rubik Vinyl',
    importName: 'RubikVinyl',
    load: () => import('./RubikVinyl') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rubik Wet Paint',
    importName: 'RubikWetPaint',
    load: () => import('./RubikWetPaint') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Ruda',
    importName: 'Ruda',
    load: () => import('./Ruda') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rufina',
    importName: 'Rufina',
    load: () => import('./Rufina') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Ruge Boogie',
    importName: 'RugeBoogie',
    load: () => import('./RugeBoogie') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Ruluko',
    importName: 'Ruluko',
    load: () => import('./Ruluko') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rum Raisin',
    importName: 'RumRaisin',
    load: () => import('./RumRaisin') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Ruslan Display',
    importName: 'RuslanDisplay',
    load: () => import('./RuslanDisplay') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Russo One',
    importName: 'RussoOne',
    load: () => import('./RussoOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Ruthie',
    importName: 'Ruthie',
    load: () => import('./Ruthie') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Ruwudu',
    importName: 'Ruwudu',
    load: () => import('./Ruwudu') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Rye',
    importName: 'Rye',
    load: () => import('./Rye') as Promise<FontInfo>,
  },
  {
    fontFamily: 'STIX Two Text',
    importName: 'STIXTwoText',
    load: () => import('./STIXTwoText') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sacramento',
    importName: 'Sacramento',
    load: () => import('./Sacramento') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sahitya',
    importName: 'Sahitya',
    load: () => import('./Sahitya') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sail',
    importName: 'Sail',
    load: () => import('./Sail') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Saira',
    importName: 'Saira',
    load: () => import('./Saira') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Saira Condensed',
    importName: 'SairaCondensed',
    load: () => import('./SairaCondensed') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Saira Extra Condensed',
    importName: 'SairaExtraCondensed',
    load: () => import('./SairaExtraCondensed') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Saira Semi Condensed',
    importName: 'SairaSemiCondensed',
    load: () => import('./SairaSemiCondensed') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Saira Stencil One',
    importName: 'SairaStencilOne',
    load: () => import('./SairaStencilOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Salsa',
    importName: 'Salsa',
    load: () => import('./Salsa') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sanchez',
    importName: 'Sanchez',
    load: () => import('./Sanchez') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sancreek',
    importName: 'Sancreek',
    load: () => import('./Sancreek') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sansita',
    importName: 'Sansita',
    load: () => import('./Sansita') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sansita Swashed',
    importName: 'SansitaSwashed',
    load: () => import('./SansitaSwashed') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sarabun',
    importName: 'Sarabun',
    load: () => import('./Sarabun') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sarala',
    importName: 'Sarala',
    load: () => import('./Sarala') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sarina',
    importName: 'Sarina',
    load: () => import('./Sarina') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sarpanch',
    importName: 'Sarpanch',
    load: () => import('./Sarpanch') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sassy Frass',
    importName: 'SassyFrass',
    load: () => import('./SassyFrass') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Satisfy',
    importName: 'Satisfy',
    load: () => import('./Satisfy') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sawarabi Gothic',
    importName: 'SawarabiGothic',
    load: () => import('./SawarabiGothic') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sawarabi Mincho',
    importName: 'SawarabiMincho',
    load: () => import('./SawarabiMincho') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Scada',
    importName: 'Scada',
    load: () => import('./Scada') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Scheherazade New',
    importName: 'ScheherazadeNew',
    load: () => import('./ScheherazadeNew') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Schibsted Grotesk',
    importName: 'SchibstedGrotesk',
    load: () => import('./SchibstedGrotesk') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Schoolbell',
    importName: 'Schoolbell',
    load: () => import('./Schoolbell') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Scope One',
    importName: 'ScopeOne',
    load: () => import('./ScopeOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Seaweed Script',
    importName: 'SeaweedScript',
    load: () => import('./SeaweedScript') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Secular One',
    importName: 'SecularOne',
    load: () => import('./SecularOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sedgwick Ave',
    importName: 'SedgwickAve',
    load: () => import('./SedgwickAve') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sedgwick Ave Display',
    importName: 'SedgwickAveDisplay',
    load: () => import('./SedgwickAveDisplay') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sen',
    importName: 'Sen',
    load: () => import('./Sen') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Send Flowers',
    importName: 'SendFlowers',
    load: () => import('./SendFlowers') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sevillana',
    importName: 'Sevillana',
    load: () => import('./Sevillana') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Seymour One',
    importName: 'SeymourOne',
    load: () => import('./SeymourOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Shadows Into Light',
    importName: 'ShadowsIntoLight',
    load: () => import('./ShadowsIntoLight') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Shadows Into Light Two',
    importName: 'ShadowsIntoLightTwo',
    load: () => import('./ShadowsIntoLightTwo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Shalimar',
    importName: 'Shalimar',
    load: () => import('./Shalimar') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Shantell Sans',
    importName: 'ShantellSans',
    load: () => import('./ShantellSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Shanti',
    importName: 'Shanti',
    load: () => import('./Shanti') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Share',
    importName: 'Share',
    load: () => import('./Share') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Share Tech',
    importName: 'ShareTech',
    load: () => import('./ShareTech') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Share Tech Mono',
    importName: 'ShareTechMono',
    load: () => import('./ShareTechMono') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Shippori Antique',
    importName: 'ShipporiAntique',
    load: () => import('./ShipporiAntique') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Shippori Antique B1',
    importName: 'ShipporiAntiqueB1',
    load: () => import('./ShipporiAntiqueB1') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Shippori Mincho',
    importName: 'ShipporiMincho',
    load: () => import('./ShipporiMincho') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Shippori Mincho B1',
    importName: 'ShipporiMinchoB1',
    load: () => import('./ShipporiMinchoB1') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Shizuru',
    importName: 'Shizuru',
    load: () => import('./Shizuru') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Shojumaru',
    importName: 'Shojumaru',
    load: () => import('./Shojumaru') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Short Stack',
    importName: 'ShortStack',
    load: () => import('./ShortStack') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Shrikhand',
    importName: 'Shrikhand',
    load: () => import('./Shrikhand') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Siemreap',
    importName: 'Siemreap',
    load: () => import('./Siemreap') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sigmar',
    importName: 'Sigmar',
    load: () => import('./Sigmar') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sigmar One',
    importName: 'SigmarOne',
    load: () => import('./SigmarOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Signika',
    importName: 'Signika',
    load: () => import('./Signika') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Signika Negative',
    importName: 'SignikaNegative',
    load: () => import('./SignikaNegative') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Silkscreen',
    importName: 'Silkscreen',
    load: () => import('./Silkscreen') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Simonetta',
    importName: 'Simonetta',
    load: () => import('./Simonetta') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Single Day',
    importName: 'SingleDay',
    load: () => import('./SingleDay') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sintony',
    importName: 'Sintony',
    load: () => import('./Sintony') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sirin Stencil',
    importName: 'SirinStencil',
    load: () => import('./SirinStencil') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Six Caps',
    importName: 'SixCaps',
    load: () => import('./SixCaps') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Skranji',
    importName: 'Skranji',
    load: () => import('./Skranji') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Slabo 13px',
    importName: 'Slabo13px',
    load: () => import('./Slabo13px') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Slabo 27px',
    importName: 'Slabo27px',
    load: () => import('./Slabo27px') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Slackey',
    importName: 'Slackey',
    load: () => import('./Slackey') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Slackside One',
    importName: 'SlacksideOne',
    load: () => import('./SlacksideOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Smokum',
    importName: 'Smokum',
    load: () => import('./Smokum') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Smooch',
    importName: 'Smooch',
    load: () => import('./Smooch') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Smooch Sans',
    importName: 'SmoochSans',
    load: () => import('./SmoochSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Smythe',
    importName: 'Smythe',
    load: () => import('./Smythe') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sniglet',
    importName: 'Sniglet',
    load: () => import('./Sniglet') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Snippet',
    importName: 'Snippet',
    load: () => import('./Snippet') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Snowburst One',
    importName: 'SnowburstOne',
    load: () => import('./SnowburstOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sofadi One',
    importName: 'SofadiOne',
    load: () => import('./SofadiOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sofia',
    importName: 'Sofia',
    load: () => import('./Sofia') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sofia Sans',
    importName: 'SofiaSans',
    load: () => import('./SofiaSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sofia Sans Condensed',
    importName: 'SofiaSansCondensed',
    load: () => import('./SofiaSansCondensed') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sofia Sans Extra Condensed',
    importName: 'SofiaSansExtraCondensed',
    load: () => import('./SofiaSansExtraCondensed') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sofia Sans Semi Condensed',
    importName: 'SofiaSansSemiCondensed',
    load: () => import('./SofiaSansSemiCondensed') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Solitreo',
    importName: 'Solitreo',
    load: () => import('./Solitreo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Solway',
    importName: 'Solway',
    load: () => import('./Solway') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sometype Mono',
    importName: 'SometypeMono',
    load: () => import('./SometypeMono') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Song Myung',
    importName: 'SongMyung',
    load: () => import('./SongMyung') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sono',
    importName: 'Sono',
    load: () => import('./Sono') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sonsie One',
    importName: 'SonsieOne',
    load: () => import('./SonsieOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sora',
    importName: 'Sora',
    load: () => import('./Sora') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sorts Mill Goudy',
    importName: 'SortsMillGoudy',
    load: () => import('./SortsMillGoudy') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Source Code Pro',
    importName: 'SourceCodePro',
    load: () => import('./SourceCodePro') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Source Sans 3',
    importName: 'SourceSans3',
    load: () => import('./SourceSans3') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Source Serif 4',
    importName: 'SourceSerif4',
    load: () => import('./SourceSerif4') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Space Grotesk',
    importName: 'SpaceGrotesk',
    load: () => import('./SpaceGrotesk') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Space Mono',
    importName: 'SpaceMono',
    load: () => import('./SpaceMono') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Special Elite',
    importName: 'SpecialElite',
    load: () => import('./SpecialElite') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Spectral',
    importName: 'Spectral',
    load: () => import('./Spectral') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Spectral SC',
    importName: 'SpectralSC',
    load: () => import('./SpectralSC') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Spicy Rice',
    importName: 'SpicyRice',
    load: () => import('./SpicyRice') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Spinnaker',
    importName: 'Spinnaker',
    load: () => import('./Spinnaker') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Spirax',
    importName: 'Spirax',
    load: () => import('./Spirax') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Splash',
    importName: 'Splash',
    load: () => import('./Splash') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Spline Sans',
    importName: 'SplineSans',
    load: () => import('./SplineSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Spline Sans Mono',
    importName: 'SplineSansMono',
    load: () => import('./SplineSansMono') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Squada One',
    importName: 'SquadaOne',
    load: () => import('./SquadaOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Square Peg',
    importName: 'SquarePeg',
    load: () => import('./SquarePeg') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sree Krushnadevaraya',
    importName: 'SreeKrushnadevaraya',
    load: () => import('./SreeKrushnadevaraya') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sriracha',
    importName: 'Sriracha',
    load: () => import('./Sriracha') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Srisakdi',
    importName: 'Srisakdi',
    load: () => import('./Srisakdi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Staatliches',
    importName: 'Staatliches',
    load: () => import('./Staatliches') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Stalemate',
    importName: 'Stalemate',
    load: () => import('./Stalemate') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Stalinist One',
    importName: 'StalinistOne',
    load: () => import('./StalinistOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Stardos Stencil',
    importName: 'StardosStencil',
    load: () => import('./StardosStencil') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Stick',
    importName: 'Stick',
    load: () => import('./Stick') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Stick No Bills',
    importName: 'StickNoBills',
    load: () => import('./StickNoBills') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Stint Ultra Condensed',
    importName: 'StintUltraCondensed',
    load: () => import('./StintUltraCondensed') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Stint Ultra Expanded',
    importName: 'StintUltraExpanded',
    load: () => import('./StintUltraExpanded') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Stoke',
    importName: 'Stoke',
    load: () => import('./Stoke') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Strait',
    importName: 'Strait',
    load: () => import('./Strait') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Style Script',
    importName: 'StyleScript',
    load: () => import('./StyleScript') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Stylish',
    importName: 'Stylish',
    load: () => import('./Stylish') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sue Ellen Francisco',
    importName: 'SueEllenFrancisco',
    load: () => import('./SueEllenFrancisco') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Suez One',
    importName: 'SuezOne',
    load: () => import('./SuezOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sulphur Point',
    importName: 'SulphurPoint',
    load: () => import('./SulphurPoint') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sumana',
    importName: 'Sumana',
    load: () => import('./Sumana') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sunflower',
    importName: 'Sunflower',
    load: () => import('./Sunflower') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sunshiney',
    importName: 'Sunshiney',
    load: () => import('./Sunshiney') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Supermercado One',
    importName: 'SupermercadoOne',
    load: () => import('./SupermercadoOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Sura',
    importName: 'Sura',
    load: () => import('./Sura') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Suranna',
    importName: 'Suranna',
    load: () => import('./Suranna') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Suravaram',
    importName: 'Suravaram',
    load: () => import('./Suravaram') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Suwannaphum',
    importName: 'Suwannaphum',
    load: () => import('./Suwannaphum') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Swanky and Moo Moo',
    importName: 'SwankyandMooMoo',
    load: () => import('./SwankyandMooMoo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Syncopate',
    importName: 'Syncopate',
    load: () => import('./Syncopate') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Syne',
    importName: 'Syne',
    load: () => import('./Syne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Syne Mono',
    importName: 'SyneMono',
    load: () => import('./SyneMono') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Syne Tactile',
    importName: 'SyneTactile',
    load: () => import('./SyneTactile') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Tai Heritage Pro',
    importName: 'TaiHeritagePro',
    load: () => import('./TaiHeritagePro') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Tajawal',
    importName: 'Tajawal',
    load: () => import('./Tajawal') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Tangerine',
    importName: 'Tangerine',
    load: () => import('./Tangerine') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Tapestry',
    importName: 'Tapestry',
    load: () => import('./Tapestry') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Taprom',
    importName: 'Taprom',
    load: () => import('./Taprom') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Tauri',
    importName: 'Tauri',
    load: () => import('./Tauri') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Taviraj',
    importName: 'Taviraj',
    load: () => import('./Taviraj') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Teko',
    importName: 'Teko',
    load: () => import('./Teko') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Tektur',
    importName: 'Tektur',
    load: () => import('./Tektur') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Telex',
    importName: 'Telex',
    load: () => import('./Telex') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Tenali Ramakrishna',
    importName: 'TenaliRamakrishna',
    load: () => import('./TenaliRamakrishna') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Tenor Sans',
    importName: 'TenorSans',
    load: () => import('./TenorSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Text Me One',
    importName: 'TextMeOne',
    load: () => import('./TextMeOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Texturina',
    importName: 'Texturina',
    load: () => import('./Texturina') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Thasadith',
    importName: 'Thasadith',
    load: () => import('./Thasadith') as Promise<FontInfo>,
  },
  {
    fontFamily: 'The Girl Next Door',
    importName: 'TheGirlNextDoor',
    load: () => import('./TheGirlNextDoor') as Promise<FontInfo>,
  },
  {
    fontFamily: 'The Nautigal',
    importName: 'TheNautigal',
    load: () => import('./TheNautigal') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Tienne',
    importName: 'Tienne',
    load: () => import('./Tienne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Tillana',
    importName: 'Tillana',
    load: () => import('./Tillana') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Tilt Neon',
    importName: 'TiltNeon',
    load: () => import('./TiltNeon') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Tilt Prism',
    importName: 'TiltPrism',
    load: () => import('./TiltPrism') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Tilt Warp',
    importName: 'TiltWarp',
    load: () => import('./TiltWarp') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Timmana',
    importName: 'Timmana',
    load: () => import('./Timmana') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Tinos',
    importName: 'Tinos',
    load: () => import('./Tinos') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Tiro Bangla',
    importName: 'TiroBangla',
    load: () => import('./TiroBangla') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Tiro Devanagari Hindi',
    importName: 'TiroDevanagariHindi',
    load: () => import('./TiroDevanagariHindi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Tiro Devanagari Marathi',
    importName: 'TiroDevanagariMarathi',
    load: () => import('./TiroDevanagariMarathi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Tiro Devanagari Sanskrit',
    importName: 'TiroDevanagariSanskrit',
    load: () => import('./TiroDevanagariSanskrit') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Tiro Gurmukhi',
    importName: 'TiroGurmukhi',
    load: () => import('./TiroGurmukhi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Tiro Kannada',
    importName: 'TiroKannada',
    load: () => import('./TiroKannada') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Tiro Tamil',
    importName: 'TiroTamil',
    load: () => import('./TiroTamil') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Tiro Telugu',
    importName: 'TiroTelugu',
    load: () => import('./TiroTelugu') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Titan One',
    importName: 'TitanOne',
    load: () => import('./TitanOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Titillium Web',
    importName: 'TitilliumWeb',
    load: () => import('./TitilliumWeb') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Tomorrow',
    importName: 'Tomorrow',
    load: () => import('./Tomorrow') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Tourney',
    importName: 'Tourney',
    load: () => import('./Tourney') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Trade Winds',
    importName: 'TradeWinds',
    load: () => import('./TradeWinds') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Train One',
    importName: 'TrainOne',
    load: () => import('./TrainOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Trirong',
    importName: 'Trirong',
    load: () => import('./Trirong') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Trispace',
    importName: 'Trispace',
    load: () => import('./Trispace') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Trocchi',
    importName: 'Trocchi',
    load: () => import('./Trocchi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Trochut',
    importName: 'Trochut',
    load: () => import('./Trochut') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Truculenta',
    importName: 'Truculenta',
    load: () => import('./Truculenta') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Trykker',
    importName: 'Trykker',
    load: () => import('./Trykker') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Tsukimi Rounded',
    importName: 'TsukimiRounded',
    load: () => import('./TsukimiRounded') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Tulpen One',
    importName: 'TulpenOne',
    load: () => import('./TulpenOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Turret Road',
    importName: 'TurretRoad',
    load: () => import('./TurretRoad') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Twinkle Star',
    importName: 'TwinkleStar',
    load: () => import('./TwinkleStar') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Ubuntu',
    importName: 'Ubuntu',
    load: () => import('./Ubuntu') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Ubuntu Condensed',
    importName: 'UbuntuCondensed',
    load: () => import('./UbuntuCondensed') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Ubuntu Mono',
    importName: 'UbuntuMono',
    load: () => import('./UbuntuMono') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Uchen',
    importName: 'Uchen',
    load: () => import('./Uchen') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Ultra',
    importName: 'Ultra',
    load: () => import('./Ultra') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Unbounded',
    importName: 'Unbounded',
    load: () => import('./Unbounded') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Uncial Antiqua',
    importName: 'UncialAntiqua',
    load: () => import('./UncialAntiqua') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Underdog',
    importName: 'Underdog',
    load: () => import('./Underdog') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Unica One',
    importName: 'UnicaOne',
    load: () => import('./UnicaOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'UnifrakturCook',
    importName: 'UnifrakturCook',
    load: () => import('./UnifrakturCook') as Promise<FontInfo>,
  },
  {
    fontFamily: 'UnifrakturMaguntia',
    importName: 'UnifrakturMaguntia',
    load: () => import('./UnifrakturMaguntia') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Unkempt',
    importName: 'Unkempt',
    load: () => import('./Unkempt') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Unlock',
    importName: 'Unlock',
    load: () => import('./Unlock') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Unna',
    importName: 'Unna',
    load: () => import('./Unna') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Updock',
    importName: 'Updock',
    load: () => import('./Updock') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Urbanist',
    importName: 'Urbanist',
    load: () => import('./Urbanist') as Promise<FontInfo>,
  },
  {
    fontFamily: 'VT323',
    importName: 'VT323',
    load: () => import('./VT323') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Vampiro One',
    importName: 'VampiroOne',
    load: () => import('./VampiroOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Varela',
    importName: 'Varela',
    load: () => import('./Varela') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Varela Round',
    importName: 'VarelaRound',
    load: () => import('./VarelaRound') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Varta',
    importName: 'Varta',
    load: () => import('./Varta') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Vast Shadow',
    importName: 'VastShadow',
    load: () => import('./VastShadow') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Vazirmatn',
    importName: 'Vazirmatn',
    load: () => import('./Vazirmatn') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Vesper Libre',
    importName: 'VesperLibre',
    load: () => import('./VesperLibre') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Viaoda Libre',
    importName: 'ViaodaLibre',
    load: () => import('./ViaodaLibre') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Vibes',
    importName: 'Vibes',
    load: () => import('./Vibes') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Vibur',
    importName: 'Vibur',
    load: () => import('./Vibur') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Victor Mono',
    importName: 'VictorMono',
    load: () => import('./VictorMono') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Vidaloka',
    importName: 'Vidaloka',
    load: () => import('./Vidaloka') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Viga',
    importName: 'Viga',
    load: () => import('./Viga') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Vina Sans',
    importName: 'VinaSans',
    load: () => import('./VinaSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Voces',
    importName: 'Voces',
    load: () => import('./Voces') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Volkhov',
    importName: 'Volkhov',
    load: () => import('./Volkhov') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Vollkorn',
    importName: 'Vollkorn',
    load: () => import('./Vollkorn') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Vollkorn SC',
    importName: 'VollkornSC',
    load: () => import('./VollkornSC') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Voltaire',
    importName: 'Voltaire',
    load: () => import('./Voltaire') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Vujahday Script',
    importName: 'VujahdayScript',
    load: () => import('./VujahdayScript') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Waiting for the Sunrise',
    importName: 'WaitingfortheSunrise',
    load: () => import('./WaitingfortheSunrise') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Wallpoet',
    importName: 'Wallpoet',
    load: () => import('./Wallpoet') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Walter Turncoat',
    importName: 'WalterTurncoat',
    load: () => import('./WalterTurncoat') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Warnes',
    importName: 'Warnes',
    load: () => import('./Warnes') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Water Brush',
    importName: 'WaterBrush',
    load: () => import('./WaterBrush') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Waterfall',
    importName: 'Waterfall',
    load: () => import('./Waterfall') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Wellfleet',
    importName: 'Wellfleet',
    load: () => import('./Wellfleet') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Wendy One',
    importName: 'WendyOne',
    load: () => import('./WendyOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Whisper',
    importName: 'Whisper',
    load: () => import('./Whisper') as Promise<FontInfo>,
  },
  {
    fontFamily: 'WindSong',
    importName: 'WindSong',
    load: () => import('./WindSong') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Wire One',
    importName: 'WireOne',
    load: () => import('./WireOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Wix Madefor Display',
    importName: 'WixMadeforDisplay',
    load: () => import('./WixMadeforDisplay') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Wix Madefor Text',
    importName: 'WixMadeforText',
    load: () => import('./WixMadeforText') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Work Sans',
    importName: 'WorkSans',
    load: () => import('./WorkSans') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Xanh Mono',
    importName: 'XanhMono',
    load: () => import('./XanhMono') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Yaldevi',
    importName: 'Yaldevi',
    load: () => import('./Yaldevi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Yanone Kaffeesatz',
    importName: 'YanoneKaffeesatz',
    load: () => import('./YanoneKaffeesatz') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Yantramanav',
    importName: 'Yantramanav',
    load: () => import('./Yantramanav') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Yatra One',
    importName: 'YatraOne',
    load: () => import('./YatraOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Yellowtail',
    importName: 'Yellowtail',
    load: () => import('./Yellowtail') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Yeon Sung',
    importName: 'YeonSung',
    load: () => import('./YeonSung') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Yeseva One',
    importName: 'YesevaOne',
    load: () => import('./YesevaOne') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Yesteryear',
    importName: 'Yesteryear',
    load: () => import('./Yesteryear') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Yomogi',
    importName: 'Yomogi',
    load: () => import('./Yomogi') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Young Serif',
    importName: 'YoungSerif',
    load: () => import('./YoungSerif') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Yrsa',
    importName: 'Yrsa',
    load: () => import('./Yrsa') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Ysabeau',
    importName: 'Ysabeau',
    load: () => import('./Ysabeau') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Ysabeau Infant',
    importName: 'YsabeauInfant',
    load: () => import('./YsabeauInfant') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Ysabeau Office',
    importName: 'YsabeauOffice',
    load: () => import('./YsabeauOffice') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Ysabeau SC',
    importName: 'YsabeauSC',
    load: () => import('./YsabeauSC') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Yuji Boku',
    importName: 'YujiBoku',
    load: () => import('./YujiBoku') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Yuji Hentaigana Akari',
    importName: 'YujiHentaiganaAkari',
    load: () => import('./YujiHentaiganaAkari') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Yuji Hentaigana Akebono',
    importName: 'YujiHentaiganaAkebono',
    load: () => import('./YujiHentaiganaAkebono') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Yuji Mai',
    importName: 'YujiMai',
    load: () => import('./YujiMai') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Yuji Syuku',
    importName: 'YujiSyuku',
    load: () => import('./YujiSyuku') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Yusei Magic',
    importName: 'YuseiMagic',
    load: () => import('./YuseiMagic') as Promise<FontInfo>,
  },
  {
    fontFamily: 'ZCOOL KuaiLe',
    importName: 'ZCOOLKuaiLe',
    load: () => import('./ZCOOLKuaiLe') as Promise<FontInfo>,
  },
  {
    fontFamily: 'ZCOOL QingKe HuangYou',
    importName: 'ZCOOLQingKeHuangYou',
    load: () => import('./ZCOOLQingKeHuangYou') as Promise<FontInfo>,
  },
  {
    fontFamily: 'ZCOOL XiaoWei',
    importName: 'ZCOOLXiaoWei',
    load: () => import('./ZCOOLXiaoWei') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Zen Antique',
    importName: 'ZenAntique',
    load: () => import('./ZenAntique') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Zen Antique Soft',
    importName: 'ZenAntiqueSoft',
    load: () => import('./ZenAntiqueSoft') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Zen Dots',
    importName: 'ZenDots',
    load: () => import('./ZenDots') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Zen Kaku Gothic Antique',
    importName: 'ZenKakuGothicAntique',
    load: () => import('./ZenKakuGothicAntique') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Zen Kaku Gothic New',
    importName: 'ZenKakuGothicNew',
    load: () => import('./ZenKakuGothicNew') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Zen Kurenaido',
    importName: 'ZenKurenaido',
    load: () => import('./ZenKurenaido') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Zen Loop',
    importName: 'ZenLoop',
    load: () => import('./ZenLoop') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Zen Maru Gothic',
    importName: 'ZenMaruGothic',
    load: () => import('./ZenMaruGothic') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Zen Old Mincho',
    importName: 'ZenOldMincho',
    load: () => import('./ZenOldMincho') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Zen Tokyo Zoo',
    importName: 'ZenTokyoZoo',
    load: () => import('./ZenTokyoZoo') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Zeyada',
    importName: 'Zeyada',
    load: () => import('./Zeyada') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Zhi Mang Xing',
    importName: 'ZhiMangXing',
    load: () => import('./ZhiMangXing') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Zilla Slab',
    importName: 'ZillaSlab',
    load: () => import('./ZillaSlab') as Promise<FontInfo>,
  },
  {
    fontFamily: 'Zilla Slab Highlight',
    importName: 'ZillaSlabHighlight',
    load: () => import('./ZillaSlabHighlight') as Promise<FontInfo>,
  },
];
