import { SourceSheet } from './types';

export const seedSheet: SourceSheet = {
  id: 'sheet-001',
  version: '1.0',
  metadata: {
    title: 'Pirsumei Nisa',
    subtitle: 'Chanukah Source Sheet',
    header: {
      left: '',
      center: 'Pirsumei Nisa',
      right: '',
    },
    footer: {
      left: '',
      center: '',
      right: '',
      showPageNumbers: true,
    },
    authorId: 'author-001',
    username: 'eyal',
    visibility: 'private',
    collaborators: [],
  },
  config: {
    paperSize: 'A4',
    margins: { top: 20, bottom: 20, left: 15, right: 15 },
    defaultStyles: {
      fontFamily: 'Times New Roman',
      fontSize: '12pt',
      justification: 'justify',
    },
    sectionNumbering: 'roman',
    sourceNumbering: 'arabic',
  },
  content: [
    {
      id: 'section-1',
      type: 'section',
      title: 'The Miracle of Chanukah',
      showBorder: true,
      children: [
        {
          id: 'source-1',
          type: 'source',
          ref: {
            en: 'Shabbat 21b',
            he: 'שבת כ״א ב',
            link: '',
          },
          content: {
            en: {
              text: 'The Gemara asks: What is Hanukkah, and why are lights kindled on Hanukkah? The Gemara answers: The Sages taught... The next year the Sages instituted those days and made them holidays with recitation of hallel and special thanksgiving in prayer and blessings.',
            },
            he: {
              text: 'מַאי חֲנוּכָּה? דְּתָנוּ רַבָּנַן... לְשָׁנָה אַחֶרֶת קְבָעוּם וַעֲשָׂאוּם יָמִים טוֹבִים בְּהַלֵּל וְהוֹדָאָה.',
            },
          },
          displayOptions: {
            layout: 'side-by-side',
            primaryLanguage: 'he',
            columnRatio: '50%',
          },
        },
        {
          id: 'source-2',
          type: 'source',
          ref: {
            en: 'Mishneh Torah, Laws of Megillah and Chanukah 3:1',
            he: "משנה תורה, הלכות מגילה וחנוכה ג׳:א׳",
            link: '',
          },
          content: {
            en: {
              text: 'In the era of the Second Temple, the Greek kingdom issued decrees against the Jewish people... sovereignty returned to Israel for more than 200 years, until the destruction of the Second Temple.',
            },
            he: {
              text: 'בְבַיִת שֵׁנִי כְּשֶׁמַּלְכֵי יָוָן גָּזְרוּ גְּזֵרוֹת... עַד הַחֻרְבָּן הַשֵּׁנִי:',
            },
          },
          displayOptions: {
            layout: 'side-by-side',
            primaryLanguage: 'he',
            columnRatio: '50%',
          },
        },
      ],
    },
    {
      id: 'section-2',
      type: 'section',
      title: 'Halachot of lighting',
      showBorder: true,
      children: [
        {
          id: 'source-3',
          type: 'source',
          ref: {
            en: 'Peninei Halacha, Zemanim 12:1',
            he: "פניני הלכה, זמנים י״ב:א׳",
            link: '',
          },
          content: {
            en: {
              text: 'The purpose of all the laws that the Sages instituted regarding where and when to light Chanukah candles is to publicize the miracle... it is sufficient for him to light one candle each night.',
            },
            he: {
              text: 'כל דיני המקום והזמן שקבעו חכמים להדלקת נר חנוכה נועדו כדי לפרסם את הנס... די לו להדליק נר אחד בכל יום.',
            },
          },
          displayOptions: {
            layout: 'stacked',
            primaryLanguage: 'he',
          },
        },
        {
          id: 'section-2-1',
          type: 'section',
          title: 'Location',
          showBorder: true,
          children: [
            {
              id: 'source-4',
              type: 'source',
              ref: {
                en: 'Shabbat 21b',
                he: 'שבת כ״א ב',
                link: '',
              },
              content: {
                en: {
                  text: 'A Hanukkah lamp that one placed above twenty cubits is invalid.',
                },
                he: {
                  text: 'נֵר שֶׁל חֲנוּכָּה שֶׁהִנִּיחָה לְמַעְלָה מֵעֶשְׂרִים אַמָּה — פְּסוּלָה',
                },
              },
              displayOptions: {
                layout: 'side-by-side',
                primaryLanguage: 'he',
                columnRatio: '50%',
              },
            },
            {
              id: 'source-5',
              type: 'source',
              ref: {
                en: 'Rashi on Shabbat 22a',
                he: 'רש"י על שבת כ״ב א',
                link: '',
              },
              content: {
                en: {
                  text: 'Invalid: Since the eye will not notice above twenty cubits, and there will be no publication of the miracle.',
                },
                he: {
                  text: "פסולה - דלא שלטא בה עינא למעלה מכ' אמה וליכא פרסומי ניסא:",
                },
              },
              displayOptions: {
                layout: 'side-by-side',
                primaryLanguage: 'he',
                columnRatio: '50%',
              },
            },
          ],
        },
      ],
    },
  ],
};
