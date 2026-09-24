(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/packages/paths/dist/esm/index.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/cut-instruction.ts
__turbopack_context__.s([
    "PathInternals",
    ()=>PathInternals,
    "cutPath",
    ()=>cutPath,
    "evolvePath",
    ()=>evolvePath,
    "extendViewBox",
    ()=>extendViewBox,
    "getBoundingBox",
    ()=>getBoundingBox,
    "getInstructionIndexAtLength",
    ()=>getInstructionIndexAtLength,
    "getLength",
    ()=>getLength,
    "getPointAtLength",
    ()=>getPointAtLength,
    "getSubpaths",
    ()=>getSubpaths,
    "getTangentAtLength",
    ()=>getTangentAtLength,
    "interpolatePath",
    ()=>interpolatePath,
    "normalizePath",
    ()=>normalizePath,
    "parsePath",
    ()=>parsePath,
    "reduceInstructions",
    ()=>reduceInstructions,
    "resetPath",
    ()=>resetPath,
    "reversePath",
    ()=>reversePath,
    "scalePath",
    ()=>scalePath,
    "serializeInstructions",
    ()=>serializeInstructions,
    "translatePath",
    ()=>translatePath,
    "warpPath",
    ()=>warpPath
]);
var cutLInstruction = ({ instruction, lastPoint, progress })=>{
    const x = lastPoint.x + (instruction.x - lastPoint.x) * progress;
    const y = lastPoint.y + (instruction.y - lastPoint.y) * progress;
    return {
        type: "L",
        x,
        y
    };
};
function interpolatePoint(pA, pB, factor) {
    return {
        x: pA.x + (pB.x - pA.x) * factor,
        y: pA.y + (pB.y - pA.y) * factor
    };
}
function cutCInstruction({ progress, lastPoint, instruction }) {
    const u = progress;
    const p0 = {
        x: lastPoint.x,
        y: lastPoint.y
    };
    const p1 = {
        x: instruction.cp1x,
        y: instruction.cp1y
    };
    const p2 = {
        x: instruction.cp2x,
        y: instruction.cp2y
    };
    const p3 = {
        x: instruction.x,
        y: instruction.y
    };
    const p01 = interpolatePoint(p0, p1, u);
    const p12 = interpolatePoint(p1, p2, u);
    const p23 = interpolatePoint(p2, p3, u);
    const p012 = interpolatePoint(p01, p12, u);
    const p123 = interpolatePoint(p12, p23, u);
    const p0123 = interpolatePoint(p012, p123, u);
    return {
        type: "C",
        cp1x: p01.x,
        cp1y: p01.y,
        cp2x: p012.x,
        cp2y: p012.y,
        x: p0123.x,
        y: p0123.y
    };
}
var cutInstruction = ({ instruction, lastPoint, progress })=>{
    if (instruction.type === "M") {
        return instruction;
    }
    if (instruction.type === "L") {
        return cutLInstruction({
            instruction,
            lastPoint,
            progress
        });
    }
    if (instruction.type === "C") {
        return cutCInstruction({
            instruction,
            lastPoint,
            progress
        });
    }
    if (instruction.type === "Z") {
        return instruction;
    }
    throw new TypeError(`${instruction.type} is not supported.`);
};
// src/helpers/bezier-values.ts
var tValues = [
    [],
    [],
    [
        -0.5773502691896257,
        0.5773502691896257
    ],
    [
        0,
        -0.7745966692414834,
        0.7745966692414834
    ],
    [
        -0.33998104358485626,
        0.33998104358485626,
        -0.8611363115940526,
        0.8611363115940526
    ],
    [
        0,
        -0.5384693101056831,
        0.5384693101056831,
        -0.906179845938664,
        0.906179845938664
    ],
    [
        0.6612093864662645,
        -0.6612093864662645,
        -0.2386191860831969,
        0.2386191860831969,
        -0.932469514203152,
        0.932469514203152
    ],
    [
        0,
        0.4058451513773972,
        -0.4058451513773972,
        -0.7415311855993945,
        0.7415311855993945,
        -0.9491079123427585,
        0.9491079123427585
    ],
    [
        -0.1834346424956498,
        0.1834346424956498,
        -0.525532409916329,
        0.525532409916329,
        -0.7966664774136267,
        0.7966664774136267,
        -0.9602898564975363,
        0.9602898564975363
    ],
    [
        0,
        -0.8360311073266358,
        0.8360311073266358,
        -0.9681602395076261,
        0.9681602395076261,
        -0.3242534234038089,
        0.3242534234038089,
        -0.6133714327005904,
        0.6133714327005904
    ],
    [
        -0.14887433898163122,
        0.14887433898163122,
        -0.4333953941292472,
        0.4333953941292472,
        -0.6794095682990244,
        0.6794095682990244,
        -0.8650633666889845,
        0.8650633666889845,
        -0.9739065285171717,
        0.9739065285171717
    ],
    [
        0,
        -0.26954315595234496,
        0.26954315595234496,
        -0.5190961292068118,
        0.5190961292068118,
        -0.7301520055740494,
        0.7301520055740494,
        -0.8870625997680953,
        0.8870625997680953,
        -0.978228658146057,
        0.978228658146057
    ],
    [
        -0.1252334085114689,
        0.1252334085114689,
        -0.3678314989981802,
        0.3678314989981802,
        -0.5873179542866175,
        0.5873179542866175,
        -0.7699026741943047,
        0.7699026741943047,
        -0.9041172563704749,
        0.9041172563704749,
        -0.9815606342467192,
        0.9815606342467192
    ],
    [
        0,
        -0.2304583159551348,
        0.2304583159551348,
        -0.44849275103644687,
        0.44849275103644687,
        -0.6423493394403402,
        0.6423493394403402,
        -0.8015780907333099,
        0.8015780907333099,
        -0.9175983992229779,
        0.9175983992229779,
        -0.9841830547185881,
        0.9841830547185881
    ],
    [
        -0.10805494870734367,
        0.10805494870734367,
        -0.31911236892788974,
        0.31911236892788974,
        -0.5152486363581541,
        0.5152486363581541,
        -0.6872929048116855,
        0.6872929048116855,
        -0.827201315069765,
        0.827201315069765,
        -0.9284348836635735,
        0.9284348836635735,
        -0.9862838086968123,
        0.9862838086968123
    ],
    [
        0,
        -0.20119409399743451,
        0.20119409399743451,
        -0.3941513470775634,
        0.3941513470775634,
        -0.5709721726085388,
        0.5709721726085388,
        -0.7244177313601701,
        0.7244177313601701,
        -0.8482065834104272,
        0.8482065834104272,
        -0.937273392400706,
        0.937273392400706,
        -0.9879925180204854,
        0.9879925180204854
    ],
    [
        -0.09501250983763744,
        0.09501250983763744,
        -0.2816035507792589,
        0.2816035507792589,
        -0.45801677765722737,
        0.45801677765722737,
        -0.6178762444026438,
        0.6178762444026438,
        -0.755404408355003,
        0.755404408355003,
        -0.8656312023878318,
        0.8656312023878318,
        -0.9445750230732326,
        0.9445750230732326,
        -0.9894009349916499,
        0.9894009349916499
    ],
    [
        0,
        -0.17848418149584785,
        0.17848418149584785,
        -0.3512317634538763,
        0.3512317634538763,
        -0.5126905370864769,
        0.5126905370864769,
        -0.6576711592166907,
        0.6576711592166907,
        -0.7815140038968014,
        0.7815140038968014,
        -0.8802391537269859,
        0.8802391537269859,
        -0.9506755217687678,
        0.9506755217687678,
        -0.9905754753144174,
        0.9905754753144174
    ],
    [
        -0.0847750130417353,
        0.0847750130417353,
        -0.2518862256915055,
        0.2518862256915055,
        -0.41175116146284263,
        0.41175116146284263,
        -0.5597708310739475,
        0.5597708310739475,
        -0.6916870430603532,
        0.6916870430603532,
        -0.8037049589725231,
        0.8037049589725231,
        -0.8926024664975557,
        0.8926024664975557,
        -0.9558239495713977,
        0.9558239495713977,
        -0.9915651684209309,
        0.9915651684209309
    ],
    [
        0,
        -0.16035864564022537,
        0.16035864564022537,
        -0.31656409996362983,
        0.31656409996362983,
        -0.46457074137596094,
        0.46457074137596094,
        -0.600545304661681,
        0.600545304661681,
        -0.7209661773352294,
        0.7209661773352294,
        -0.8227146565371428,
        0.8227146565371428,
        -0.9031559036148179,
        0.9031559036148179,
        -0.96020815213483,
        0.96020815213483,
        -0.9924068438435844,
        0.9924068438435844
    ],
    [
        -0.07652652113349734,
        0.07652652113349734,
        -0.22778585114164507,
        0.22778585114164507,
        -0.37370608871541955,
        0.37370608871541955,
        -0.5108670019508271,
        0.5108670019508271,
        -0.636053680726515,
        0.636053680726515,
        -0.7463319064601508,
        0.7463319064601508,
        -0.8391169718222188,
        0.8391169718222188,
        -0.912234428251326,
        0.912234428251326,
        -0.9639719272779138,
        0.9639719272779138,
        -0.9931285991850949,
        0.9931285991850949
    ],
    [
        0,
        -0.1455618541608951,
        0.1455618541608951,
        -0.2880213168024011,
        0.2880213168024011,
        -0.4243421202074388,
        0.4243421202074388,
        -0.5516188358872198,
        0.5516188358872198,
        -0.6671388041974123,
        0.6671388041974123,
        -0.7684399634756779,
        0.7684399634756779,
        -0.8533633645833173,
        0.8533633645833173,
        -0.9200993341504008,
        0.9200993341504008,
        -0.9672268385663063,
        0.9672268385663063,
        -0.9937521706203895,
        0.9937521706203895
    ],
    [
        -0.06973927331972223,
        0.06973927331972223,
        -0.20786042668822127,
        0.20786042668822127,
        -0.34193582089208424,
        0.34193582089208424,
        -0.469355837986757,
        0.469355837986757,
        -0.5876404035069116,
        0.5876404035069116,
        -0.6944872631866827,
        0.6944872631866827,
        -0.7878168059792081,
        0.7878168059792081,
        -0.8658125777203002,
        0.8658125777203002,
        -0.926956772187174,
        0.926956772187174,
        -0.9700604978354287,
        0.9700604978354287,
        -0.9942945854823992,
        0.9942945854823992
    ],
    [
        0,
        -0.1332568242984661,
        0.1332568242984661,
        -0.26413568097034495,
        0.26413568097034495,
        -0.3903010380302908,
        0.3903010380302908,
        -0.5095014778460075,
        0.5095014778460075,
        -0.6196098757636461,
        0.6196098757636461,
        -0.7186613631319502,
        0.7186613631319502,
        -0.8048884016188399,
        0.8048884016188399,
        -0.8767523582704416,
        0.8767523582704416,
        -0.9329710868260161,
        0.9329710868260161,
        -0.9725424712181152,
        0.9725424712181152,
        -0.9947693349975522,
        0.9947693349975522
    ],
    [
        -0.06405689286260563,
        0.06405689286260563,
        -0.1911188674736163,
        0.1911188674736163,
        -0.3150426796961634,
        0.3150426796961634,
        -0.4337935076260451,
        0.4337935076260451,
        -0.5454214713888396,
        0.5454214713888396,
        -0.6480936519369755,
        0.6480936519369755,
        -0.7401241915785544,
        0.7401241915785544,
        -0.820001985973903,
        0.820001985973903,
        -0.8864155270044011,
        0.8864155270044011,
        -0.9382745520027328,
        0.9382745520027328,
        -0.9747285559713095,
        0.9747285559713095,
        -0.9951872199970213,
        0.9951872199970213
    ]
];
var cValues = [
    [],
    [],
    [
        1,
        1
    ],
    [
        0.8888888888888888,
        0.5555555555555556,
        0.5555555555555556
    ],
    [
        0.6521451548625461,
        0.6521451548625461,
        0.34785484513745385,
        0.34785484513745385
    ],
    [
        0.5688888888888889,
        0.47862867049936647,
        0.47862867049936647,
        0.23692688505618908,
        0.23692688505618908
    ],
    [
        0.3607615730481386,
        0.3607615730481386,
        0.46791393457269104,
        0.46791393457269104,
        0.17132449237917036,
        0.17132449237917036
    ],
    [
        0.4179591836734694,
        0.3818300505051189,
        0.3818300505051189,
        0.27970539148927664,
        0.27970539148927664,
        0.1294849661688697,
        0.1294849661688697
    ],
    [
        0.362683783378362,
        0.362683783378362,
        0.31370664587788727,
        0.31370664587788727,
        0.22238103445337448,
        0.22238103445337448,
        0.10122853629037626,
        0.10122853629037626
    ],
    [
        0.3302393550012598,
        0.1806481606948574,
        0.1806481606948574,
        0.08127438836157441,
        0.08127438836157441,
        0.31234707704000286,
        0.31234707704000286,
        0.26061069640293544,
        0.26061069640293544
    ],
    [
        0.29552422471475287,
        0.29552422471475287,
        0.26926671930999635,
        0.26926671930999635,
        0.21908636251598204,
        0.21908636251598204,
        0.1494513491505806,
        0.1494513491505806,
        0.06667134430868814,
        0.06667134430868814
    ],
    [
        0.2729250867779006,
        0.26280454451024665,
        0.26280454451024665,
        0.23319376459199048,
        0.23319376459199048,
        0.18629021092773426,
        0.18629021092773426,
        0.1255803694649046,
        0.1255803694649046,
        0.05566856711617366,
        0.05566856711617366
    ],
    [
        0.24914704581340277,
        0.24914704581340277,
        0.2334925365383548,
        0.2334925365383548,
        0.20316742672306592,
        0.20316742672306592,
        0.16007832854334622,
        0.16007832854334622,
        0.10693932599531843,
        0.10693932599531843,
        0.04717533638651183,
        0.04717533638651183
    ],
    [
        0.2325515532308739,
        0.22628318026289723,
        0.22628318026289723,
        0.2078160475368885,
        0.2078160475368885,
        0.17814598076194574,
        0.17814598076194574,
        0.13887351021978725,
        0.13887351021978725,
        0.09212149983772845,
        0.09212149983772845,
        0.04048400476531588,
        0.04048400476531588
    ],
    [
        0.2152638534631578,
        0.2152638534631578,
        0.2051984637212956,
        0.2051984637212956,
        0.18553839747793782,
        0.18553839747793782,
        0.15720316715819355,
        0.15720316715819355,
        0.12151857068790319,
        0.12151857068790319,
        0.08015808715976021,
        0.08015808715976021,
        0.03511946033175186,
        0.03511946033175186
    ],
    [
        0.2025782419255613,
        0.19843148532711158,
        0.19843148532711158,
        0.1861610000155622,
        0.1861610000155622,
        0.16626920581699392,
        0.16626920581699392,
        0.13957067792615432,
        0.13957067792615432,
        0.10715922046717194,
        0.10715922046717194,
        0.07036604748810812,
        0.07036604748810812,
        0.03075324199611727,
        0.03075324199611727
    ],
    [
        0.1894506104550685,
        0.1894506104550685,
        0.18260341504492358,
        0.18260341504492358,
        0.16915651939500254,
        0.16915651939500254,
        0.14959598881657674,
        0.14959598881657674,
        0.12462897125553388,
        0.12462897125553388,
        0.09515851168249279,
        0.09515851168249279,
        0.062253523938647894,
        0.062253523938647894,
        0.027152459411754096,
        0.027152459411754096
    ],
    [
        0.17944647035620653,
        0.17656270536699264,
        0.17656270536699264,
        0.16800410215645004,
        0.16800410215645004,
        0.15404576107681028,
        0.15404576107681028,
        0.13513636846852548,
        0.13513636846852548,
        0.11188384719340397,
        0.11188384719340397,
        0.08503614831717918,
        0.08503614831717918,
        0.0554595293739872,
        0.0554595293739872,
        0.02414830286854793,
        0.02414830286854793
    ],
    [
        0.1691423829631436,
        0.1691423829631436,
        0.16427648374583273,
        0.16427648374583273,
        0.15468467512626524,
        0.15468467512626524,
        0.14064291467065065,
        0.14064291467065065,
        0.12255520671147846,
        0.12255520671147846,
        0.10094204410628717,
        0.10094204410628717,
        0.07642573025488905,
        0.07642573025488905,
        0.0497145488949698,
        0.0497145488949698,
        0.02161601352648331,
        0.02161601352648331
    ],
    [
        0.1610544498487837,
        0.15896884339395434,
        0.15896884339395434,
        0.15276604206585967,
        0.15276604206585967,
        0.1426067021736066,
        0.1426067021736066,
        0.12875396253933621,
        0.12875396253933621,
        0.11156664554733399,
        0.11156664554733399,
        0.09149002162245,
        0.09149002162245,
        0.06904454273764123,
        0.06904454273764123,
        0.0448142267656996,
        0.0448142267656996,
        0.019461788229726478,
        0.019461788229726478
    ],
    [
        0.15275338713072584,
        0.15275338713072584,
        0.14917298647260374,
        0.14917298647260374,
        0.14209610931838204,
        0.14209610931838204,
        0.13168863844917664,
        0.13168863844917664,
        0.11819453196151841,
        0.11819453196151841,
        0.10193011981724044,
        0.10193011981724044,
        0.08327674157670475,
        0.08327674157670475,
        0.06267204833410907,
        0.06267204833410907,
        0.04060142980038694,
        0.04060142980038694,
        0.017614007139152118,
        0.017614007139152118
    ],
    [
        0.14608113364969041,
        0.14452440398997005,
        0.14452440398997005,
        0.13988739479107315,
        0.13988739479107315,
        0.13226893863333747,
        0.13226893863333747,
        0.12183141605372853,
        0.12183141605372853,
        0.10879729916714838,
        0.10879729916714838,
        0.09344442345603386,
        0.09344442345603386,
        0.0761001136283793,
        0.0761001136283793,
        0.057134425426857205,
        0.057134425426857205,
        0.036953789770852494,
        0.036953789770852494,
        0.016017228257774335,
        0.016017228257774335
    ],
    [
        0.13925187285563198,
        0.13925187285563198,
        0.13654149834601517,
        0.13654149834601517,
        0.13117350478706238,
        0.13117350478706238,
        0.12325237681051242,
        0.12325237681051242,
        0.11293229608053922,
        0.11293229608053922,
        0.10041414444288096,
        0.10041414444288096,
        0.08594160621706773,
        0.08594160621706773,
        0.06979646842452049,
        0.06979646842452049,
        0.052293335152683286,
        0.052293335152683286,
        0.03377490158481415,
        0.03377490158481415,
        0.0146279952982722,
        0.0146279952982722
    ],
    [
        0.13365457218610619,
        0.1324620394046966,
        0.1324620394046966,
        0.12890572218808216,
        0.12890572218808216,
        0.12304908430672953,
        0.12304908430672953,
        0.11499664022241136,
        0.11499664022241136,
        0.10489209146454141,
        0.10489209146454141,
        0.09291576606003515,
        0.09291576606003515,
        0.07928141177671895,
        0.07928141177671895,
        0.06423242140852585,
        0.06423242140852585,
        0.04803767173108467,
        0.04803767173108467,
        0.030988005856979445,
        0.030988005856979445,
        0.013411859487141771,
        0.013411859487141771
    ],
    [
        0.12793819534675216,
        0.12793819534675216,
        0.1258374563468283,
        0.1258374563468283,
        0.12167047292780339,
        0.12167047292780339,
        0.1155056680537256,
        0.1155056680537256,
        0.10744427011596563,
        0.10744427011596563,
        0.09761865210411388,
        0.09761865210411388,
        0.08619016153195327,
        0.08619016153195327,
        0.0733464814110803,
        0.0733464814110803,
        0.05929858491543678,
        0.05929858491543678,
        0.04427743881741981,
        0.04427743881741981,
        0.028531388628933663,
        0.028531388628933663,
        0.0123412297999872,
        0.0123412297999872
    ]
];
var binomialCoefficients = [
    [
        1
    ],
    [
        1,
        1
    ],
    [
        1,
        2,
        1
    ],
    [
        1,
        3,
        3,
        1
    ]
];
// src/helpers/bezier-functions.ts
var cubicPoint = (xs, ys, t)=>{
    const x = (1 - t) * (1 - t) * (1 - t) * xs[0] + 3 * (1 - t) * (1 - t) * t * xs[1] + 3 * (1 - t) * t * t * xs[2] + t * t * t * xs[3];
    const y = (1 - t) * (1 - t) * (1 - t) * ys[0] + 3 * (1 - t) * (1 - t) * t * ys[1] + 3 * (1 - t) * t * t * ys[2] + t * t * t * ys[3];
    return {
        x,
        y
    };
};
var getDerivative = (derivative, t, vs)=>{
    const n = vs.length - 1;
    let value;
    if (n === 0) {
        return 0;
    }
    if (derivative === 0) {
        value = 0;
        for(let k = 0; k <= n; k++){
            value += binomialCoefficients[n][k] * (1 - t) ** (n - k) * t ** k * vs[k];
        }
        return value;
    }
    const _vs = new Array(n);
    for(let k = 0; k < n; k++){
        _vs[k] = n * (vs[k + 1] - vs[k]);
    }
    return getDerivative(derivative - 1, t, _vs);
};
function bFunc(xs, ys, t) {
    const xbase = getDerivative(1, t, xs);
    const ybase = getDerivative(1, t, ys);
    const combined = xbase * xbase + ybase * ybase;
    return Math.sqrt(combined);
}
var getCubicArcLength = ({ sx, sy, t })=>{
    let correctedT;
    const n = 20;
    const z = t / 2;
    let sum = 0;
    for(let i = 0; i < n; i++){
        correctedT = z * tValues[n][i] + z;
        sum += cValues[n][i] * bFunc(sx, sy, correctedT);
    }
    return z * sum;
};
var quadraticPoint = (xs, ys, t)=>{
    const x = (1 - t) * (1 - t) * xs[0] + 2 * (1 - t) * t * xs[1] + t * t * xs[2];
    const y = (1 - t) * (1 - t) * ys[0] + 2 * (1 - t) * t * ys[1] + t * t * ys[2];
    return {
        x,
        y
    };
};
var cubicDerivative = (xs, ys, t)=>{
    const derivative = quadraticPoint([
        3 * (xs[1] - xs[0]),
        3 * (xs[2] - xs[1]),
        3 * (xs[3] - xs[2])
    ], [
        3 * (ys[1] - ys[0]),
        3 * (ys[2] - ys[1]),
        3 * (ys[3] - ys[2])
    ], t);
    return derivative;
};
var getQuadraticArcLength = (xs, ys, t)=>{
    if (t === undefined) {
        t = 1;
    }
    const ax = xs[0] - 2 * xs[1] + xs[2];
    const ay = ys[0] - 2 * ys[1] + ys[2];
    const bx = 2 * xs[1] - 2 * xs[0];
    const by = 2 * ys[1] - 2 * ys[0];
    const A = 4 * (ax * ax + ay * ay);
    const B = 4 * (ax * bx + ay * by);
    const C = bx * bx + by * by;
    if (A === 0) {
        return t * Math.sqrt((xs[2] - xs[0]) ** 2 + (ys[2] - ys[0]) ** 2);
    }
    const b = B / (2 * A);
    const c = C / A;
    const u = t + b;
    const k = c - b * b;
    const uuk = u * u + k > 0 ? Math.sqrt(u * u + k) : 0;
    const bbk = b * b + k > 0 ? Math.sqrt(b * b + k) : 0;
    const term = b + Math.sqrt(b * b + k) === 0 ? 0 : k * Math.log(Math.abs((u + uuk) / (b + bbk)));
    return Math.sqrt(A) / 2 * (u * uuk - b * bbk + term);
};
var quadraticDerivative = (xs, ys, t)=>{
    return {
        x: (1 - t) * 2 * (xs[1] - xs[0]) + t * 2 * (xs[2] - xs[1]),
        y: (1 - t) * 2 * (ys[1] - ys[0]) + t * 2 * (ys[2] - ys[1])
    };
};
var t2length = ({ length, totalLength, func })=>{
    let error = 1;
    let t = length / totalLength;
    let step = (length - func(t)) / totalLength;
    let numIterations = 0;
    while(error > 0.001){
        const increasedTLength = func(t + step);
        const increasedTError = Math.abs(length - increasedTLength) / totalLength;
        if (increasedTError < error) {
            error = increasedTError;
            t += step;
        } else {
            const decreasedTLength = func(t - step);
            const decreasedTError = Math.abs(length - decreasedTLength) / totalLength;
            if (decreasedTError < error) {
                error = decreasedTError;
                t -= step;
            } else {
                step /= 2;
            }
        }
        numIterations++;
        if (numIterations > 500) {
            break;
        }
    }
    return t;
};
// src/helpers/bezier.ts
var makeQuadratic = ({ startX, startY, cpx, cpy, x, y })=>{
    const a = {
        x: startX,
        y: startY
    };
    const b = {
        x: cpx,
        y: cpy
    };
    const c = {
        x,
        y
    };
    const length = getQuadraticArcLength([
        a.x,
        b.x,
        c.x,
        0
    ], [
        a.y,
        b.y,
        c.y,
        0
    ], 1);
    const getTotalLength = ()=>{
        return length;
    };
    const getPointAtLength = (len)=>{
        const xs = [
            a.x,
            b.x,
            c.x,
            0
        ];
        const xy = [
            a.y,
            b.y,
            c.y,
            0
        ];
        const t = t2length({
            length: len,
            totalLength: length,
            func: (i)=>getQuadraticArcLength(xs, xy, i)
        });
        return quadraticPoint(xs, xy, t);
    };
    const getTangentAtLength = (len)=>{
        const xs = [
            a.x,
            b.x,
            c.x,
            0
        ];
        const xy = [
            a.y,
            b.y,
            c.y,
            0
        ];
        const t = t2length({
            length: len,
            totalLength: length,
            func: (i)=>getQuadraticArcLength(xs, xy, i)
        });
        const derivative = quadraticDerivative(xs, xy, t);
        const mdl = Math.sqrt(derivative.x * derivative.x + derivative.y * derivative.y);
        let tangent;
        if (mdl > 0) {
            tangent = {
                x: derivative.x / mdl,
                y: derivative.y / mdl
            };
        } else {
            tangent = {
                x: 0,
                y: 0
            };
        }
        return tangent;
    };
    const getC = ()=>{
        return c;
    };
    return {
        getPointAtLength,
        getTangentAtLength,
        getTotalLength,
        getC,
        type: "quadratic-bezier",
        getD: ()=>({
                x: 0,
                y: 0
            })
    };
};
var makeCubic = ({ startX, startY, cp1x, cp1y, cp2x, cp2y, x, y })=>{
    const a = {
        x: startX,
        y: startY
    };
    const b = {
        x: cp1x,
        y: cp1y
    };
    const c = {
        x: cp2x,
        y: cp2y
    };
    const d = {
        x,
        y
    };
    const length = getCubicArcLength({
        sx: [
            a.x,
            b.x,
            c.x,
            d.x
        ],
        sy: [
            a.y,
            b.y,
            c.y,
            d.y
        ],
        t: 1
    });
    const getTotalLength = ()=>{
        return length;
    };
    const getPointAtLength = (len)=>{
        const sx = [
            a.x,
            b.x,
            c.x,
            d.x
        ];
        const sy = [
            a.y,
            b.y,
            c.y,
            d.y
        ];
        const t = t2length({
            length: len,
            totalLength: length,
            func: (i)=>{
                return getCubicArcLength({
                    sx,
                    sy,
                    t: i
                });
            }
        });
        return cubicPoint(sx, sy, t);
    };
    const getTangentAtLength = (len)=>{
        const xs = [
            a.x,
            b.x,
            c.x,
            d.x
        ];
        const xy = [
            a.y,
            b.y,
            c.y,
            d.y
        ];
        const t = t2length({
            length: len,
            totalLength: length,
            func: (i)=>getCubicArcLength({
                    sx: xs,
                    sy: xy,
                    t: i
                })
        });
        const derivative = cubicDerivative(xs, xy, t);
        const mdl = Math.sqrt(derivative.x * derivative.x + derivative.y * derivative.y);
        let tangent;
        if (mdl > 0) {
            tangent = {
                x: derivative.x / mdl,
                y: derivative.y / mdl
            };
        } else {
            tangent = {
                x: 0,
                y: 0
            };
        }
        return tangent;
    };
    const getC = ()=>{
        return c;
    };
    const getD = ()=>{
        return d;
    };
    return {
        getPointAtLength,
        getTangentAtLength,
        getTotalLength,
        getC,
        getD,
        type: "cubic-bezier"
    };
};
// src/helpers/linear.ts
var makeLinearPosition = ({ x0, x1, y0, y1 })=>{
    return {
        getTotalLength: ()=>{
            return Math.sqrt((x0 - x1) ** 2 + (y0 - y1) ** 2);
        },
        getPointAtLength: (pos)=>{
            let fraction = pos / Math.sqrt((x0 - x1) ** 2 + (y0 - y1) ** 2);
            fraction = Number.isNaN(fraction) ? 1 : fraction;
            const newDeltaX = (x1 - x0) * fraction;
            const newDeltaY = (y1 - y0) * fraction;
            return {
                x: x0 + newDeltaX,
                y: y0 + newDeltaY
            };
        },
        getTangentAtLength: ()=>{
            const module = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
            return {
                x: (x1 - x0) / module,
                y: (y1 - y0) / module
            };
        },
        type: "linear"
    };
};
// src/helpers/reduced-analysis.ts
var conductAnalysis = (instructions)=>{
    let currentPoint = {
        x: 0,
        y: 0
    };
    let moveStart = {
        x: 0,
        y: 0
    };
    const segments = [];
    for(let i = 0; i < instructions.length; i++){
        const instruction = instructions[i];
        if (instruction.type === "M") {
            currentPoint = {
                x: instruction.x,
                y: instruction.y
            };
            moveStart = {
                x: currentPoint.x,
                y: currentPoint.y
            };
            segments.push({
                startPoint: {
                    x: instruction.x,
                    y: instruction.y
                },
                instructionsAndInfo: [
                    {
                        instruction,
                        function: null,
                        length: 0,
                        startPoint: currentPoint
                    }
                ]
            });
        }
        if (instruction.type === "L") {
            if (segments.length > 0) {
                const length = Math.sqrt((currentPoint.x - instruction.x) ** 2 + (currentPoint.y - instruction.y) ** 2);
                segments[segments.length - 1].instructionsAndInfo.push({
                    instruction,
                    length,
                    function: makeLinearPosition({
                        x0: currentPoint.x,
                        x1: instruction.x,
                        y0: currentPoint.y,
                        y1: instruction.y
                    }),
                    startPoint: currentPoint
                });
            }
            currentPoint = {
                x: instruction.x,
                y: instruction.y
            };
        }
        if (instruction.type === "Z") {
            if (segments.length > 0) {
                const length = Math.sqrt((segments[segments.length - 1].startPoint.x - currentPoint.x) ** 2 + (segments[segments.length - 1].startPoint.y - currentPoint.y) ** 2);
                segments[segments.length - 1].instructionsAndInfo.push({
                    instruction,
                    function: makeLinearPosition({
                        x0: currentPoint.x,
                        x1: moveStart.x,
                        y0: currentPoint.y,
                        y1: moveStart.y
                    }),
                    length,
                    startPoint: {
                        ...currentPoint
                    }
                });
            }
            currentPoint = {
                x: moveStart.x,
                y: moveStart.y
            };
        }
        if (instruction.type === "C") {
            const curve = makeCubic({
                startX: currentPoint.x,
                startY: currentPoint.y,
                cp1x: instruction.cp1x,
                cp1y: instruction.cp1y,
                cp2x: instruction.cp2x,
                cp2y: instruction.cp2y,
                x: instruction.x,
                y: instruction.y
            });
            const length = curve.getTotalLength();
            if (segments.length > 0) {
                segments[segments.length - 1].instructionsAndInfo.push({
                    instruction,
                    length,
                    function: curve,
                    startPoint: {
                        ...currentPoint
                    }
                });
            }
            currentPoint = {
                x: instruction.x,
                y: instruction.y
            };
        }
    }
    return segments;
};
// src/parse-path.ts
var length = {
    a: 7,
    A: 7,
    C: 6,
    c: 6,
    H: 1,
    h: 1,
    L: 2,
    l: 2,
    M: 2,
    m: 2,
    Q: 4,
    q: 4,
    S: 4,
    s: 4,
    T: 2,
    t: 2,
    V: 1,
    v: 1,
    Z: 0,
    z: 0
};
var chunkExact = (array, instruction)=>{
    const chunks = [];
    const expectedSize = length[instruction];
    if (array.length % expectedSize !== 0) {
        throw new Error(`Expected number of arguments of SVG instruction "${instruction} ${array.join(" ")}" to be a multiple of ${expectedSize}`);
    }
    for(let i = 0; i < array.length; i += expectedSize){
        chunks.push(array.slice(i, i + expectedSize));
    }
    return chunks;
};
var makeInstructions = (arr, instruction, cb)=>{
    return chunkExact(arr, instruction).map((args)=>{
        return cb(args);
    });
};
var segmentRegExp = /([astvzqmhlc])([^astvzqmhlc]*)/gi;
var numberRegExp = /-?[0-9]*\.?[0-9]+(?:e[-+]?\d+)?/gi;
var parseValues = (args, instructionType)=>{
    const numbers = args.match(numberRegExp);
    if (!numbers) {
        if (instructionType === "Z" || instructionType === "z") {
            return [];
        }
        throw new Error(`Malformed path data: ${instructionType} was expected to have numbers afterwards`);
    }
    const expectedArguments = length[instructionType];
    if (numbers.length % expectedArguments !== 0) {
        throw new Error(`Malformed path data: ${instructionType} was expected to have a multiple of ${expectedArguments} numbers, but got "${instructionType} ${numbers.join(" ")} instead"`);
    }
    return numbers.map(Number);
};
var parsePath = (path)=>{
    if (!path) {
        throw new Error("No path provided");
    }
    const segments = path.match(segmentRegExp);
    if (!segments) {
        throw new Error(`No path elements found in string ${path}`);
    }
    return segments.map((segmentString)=>{
        const command = segmentString.charAt(0);
        const args = parseValues(segmentString.substring(1), command);
        if (command === "M" && args.length > 2) {
            const segmentsArray = [];
            segmentsArray.push({
                type: command,
                x: args[0],
                y: args[1]
            });
            segmentsArray.push(...makeInstructions(args.slice(2), "L", (numbers)=>({
                    type: "L",
                    x: numbers[0],
                    y: numbers[1]
                })));
            return segmentsArray;
        }
        if (command === "m" && args.length > 2) {
            const segmentsArray = [];
            segmentsArray.push({
                type: command,
                dx: args[0],
                dy: args[1]
            });
            segmentsArray.push(...makeInstructions(args.slice(2), "l", (numbers)=>({
                    type: "l",
                    dx: numbers[0],
                    dy: numbers[1]
                })));
            return segmentsArray;
        }
        if (command === "Z" || command === "z") {
            return [
                {
                    type: "Z"
                }
            ];
        }
        if (command === "A") {
            return makeInstructions(args, command, (numbers)=>({
                    type: command,
                    rx: numbers[0],
                    ry: numbers[1],
                    xAxisRotation: numbers[2],
                    largeArcFlag: numbers[3] === 1,
                    sweepFlag: numbers[4] === 1,
                    x: numbers[5],
                    y: numbers[6]
                }));
        }
        if (command === "a") {
            return makeInstructions(args, command, (numbers)=>({
                    type: command,
                    rx: numbers[0],
                    ry: numbers[1],
                    xAxisRotation: numbers[2],
                    largeArcFlag: numbers[3] === 1,
                    sweepFlag: numbers[4] === 1,
                    dx: numbers[5],
                    dy: numbers[6]
                }));
        }
        if (command === "C") {
            return makeInstructions(args, command, (numbers)=>({
                    type: command,
                    cp1x: numbers[0],
                    cp1y: numbers[1],
                    cp2x: numbers[2],
                    cp2y: numbers[3],
                    x: numbers[4],
                    y: numbers[5]
                }));
        }
        if (command === "c") {
            return makeInstructions(args, command, (numbers)=>({
                    type: command,
                    cp1dx: numbers[0],
                    cp1dy: numbers[1],
                    cp2dx: numbers[2],
                    cp2dy: numbers[3],
                    dx: numbers[4],
                    dy: numbers[5]
                }));
        }
        if (command === "S") {
            return makeInstructions(args, command, (numbers)=>({
                    type: command,
                    cpx: numbers[0],
                    cpy: numbers[1],
                    x: numbers[2],
                    y: numbers[3]
                }));
        }
        if (command === "s") {
            return makeInstructions(args, command, (numbers)=>({
                    type: command,
                    cpdx: numbers[0],
                    cpdy: numbers[1],
                    dx: numbers[2],
                    dy: numbers[3]
                }));
        }
        if (command === "H") {
            return makeInstructions(args, command, (numbers)=>({
                    type: command,
                    x: numbers[0]
                }));
        }
        if (command === "h") {
            return makeInstructions(args, command, (numbers)=>({
                    type: command,
                    dx: numbers[0]
                }));
        }
        if (command === "V") {
            return makeInstructions(args, command, (numbers)=>({
                    type: command,
                    y: numbers[0]
                }));
        }
        if (command === "v") {
            return makeInstructions(args, command, (numbers)=>({
                    type: command,
                    dy: numbers[0]
                }));
        }
        if (command === "L") {
            return makeInstructions(args, command, (numbers)=>({
                    type: command,
                    x: numbers[0],
                    y: numbers[1]
                }));
        }
        if (command === "M") {
            return makeInstructions(args, command, (numbers)=>({
                    type: command,
                    x: numbers[0],
                    y: numbers[1]
                }));
        }
        if (command === "m") {
            return makeInstructions(args, command, (numbers)=>({
                    type: command,
                    dx: numbers[0],
                    dy: numbers[1]
                }));
        }
        if (command === "l") {
            return makeInstructions(args, command, (numbers)=>({
                    type: command,
                    dx: numbers[0],
                    dy: numbers[1]
                }));
        }
        if (command === "Q") {
            return makeInstructions(args, command, (numbers)=>({
                    type: command,
                    cpx: numbers[0],
                    cpy: numbers[1],
                    x: numbers[2],
                    y: numbers[3]
                }));
        }
        if (command === "q") {
            return makeInstructions(args, command, (numbers)=>({
                    type: command,
                    cpdx: numbers[0],
                    cpdy: numbers[1],
                    dx: numbers[2],
                    dy: numbers[3]
                }));
        }
        if (command === "T") {
            return makeInstructions(args, command, (numbers)=>({
                    type: command,
                    x: numbers[0],
                    y: numbers[1]
                }));
        }
        if (command === "t") {
            return makeInstructions(args, command, (numbers)=>({
                    type: command,
                    dx: numbers[0],
                    dy: numbers[1]
                }));
        }
        throw new Error(`Invalid path element ${segmentString}`);
    }, []).flat(1);
};
// src/helpers/convert-q-to-c-instruction.ts
var convertQToCInstruction = (instruction, startPoint)=>{
    const cp1x = startPoint.x + 2 / 3 * (instruction.cpx - startPoint.x);
    const cp1y = startPoint.y + 2 / 3 * (instruction.cpy - startPoint.y);
    const cp2x = instruction.x + 2 / 3 * (instruction.cpx - instruction.x);
    const cp2y = instruction.y + 2 / 3 * (instruction.cpy - instruction.y);
    return {
        type: "C",
        cp1x,
        cp1y,
        cp2x,
        cp2y,
        x: instruction.x,
        y: instruction.y
    };
};
// src/helpers/iterate.ts
var iterateOverSegments = ({ segments, iterate })=>{
    let x = 0;
    let y = 0;
    let initialX = 0;
    let initialY = 0;
    let cpX = null;
    let cpY = null;
    const newSegments = segments.map((s, i)=>{
        const newSeg = iterate({
            segment: s,
            x,
            y,
            prevSegment: segments[i - 1] ?? null,
            initialX,
            initialY,
            cpX,
            cpY
        });
        switch(s.type){
            case "M":
                initialX = s.x;
                initialY = s.y;
                x = s.x;
                y = s.y;
                cpX = null;
                cpY = null;
                break;
            case "Q":
                x = s.x;
                y = s.y;
                cpX = s.cpx;
                cpY = s.cpy;
                break;
            case "A":
                x = s.x;
                y = s.y;
                cpX = null;
                cpY = null;
                break;
            case "C":
                x = s.x;
                y = s.y;
                cpX = s.cp2x;
                cpY = s.cp2y;
                break;
            case "S":
                x = s.x;
                y = s.y;
                cpX = s.cpx;
                cpY = s.cpy;
                break;
            case "T":
                if (cpX !== null && cpY !== null) {
                    cpX = x - (cpX - x);
                    cpY = y - (cpY - y);
                }
                x = s.x;
                y = s.y;
                break;
            case "L":
                x = s.x;
                y = s.y;
                cpX = null;
                cpY = null;
                break;
            case "V":
                y = s.y;
                cpX = null;
                cpY = null;
                break;
            case "H":
                x = s.x;
                cpX = null;
                cpY = null;
                break;
            case "Z":
                x = initialX;
                y = initialY;
                cpX = null;
                cpY = null;
                break;
            default:
                throw new Error(`Unexpected instruction ${s.type}`);
        }
        return newSeg;
    });
    return newSegments.flat(1);
};
// src/helpers/remove-a-s-t-curves.ts
var TAU = Math.PI * 2;
function approximate_unit_arc(theta1, delta_theta) {
    const alpha = 4 / 3 * Math.tan(delta_theta / 4);
    const x1 = Math.cos(theta1);
    const y1 = Math.sin(theta1);
    const x2 = Math.cos(theta1 + delta_theta);
    const y2 = Math.sin(theta1 + delta_theta);
    return [
        x1,
        y1,
        x1 - y1 * alpha,
        y1 + x1 * alpha,
        x2 + y2 * alpha,
        y2 - x2 * alpha,
        x2,
        y2
    ];
}
function unit_vector_angle(ux, uy, vx, vy) {
    const sign = ux * vy - uy * vx < 0 ? -1 : 1;
    let dot = ux * vx + uy * vy;
    if (dot > 1) {
        dot = 1;
    }
    if (dot < -1) {
        dot = -1;
    }
    return sign * Math.acos(dot);
}
function get_arc_center({ x1, y1, x2, y2, largeArcFlag, sweepFlag, rx, ry, sin_phi, cos_phi }) {
    const x1p = cos_phi * (x1 - x2) / 2 + sin_phi * (y1 - y2) / 2;
    const y1p = -sin_phi * (x1 - x2) / 2 + cos_phi * (y1 - y2) / 2;
    const rx_sq = rx * rx;
    const ry_sq = ry * ry;
    const x1p_sq = x1p * x1p;
    const y1p_sq = y1p * y1p;
    let radicant = rx_sq * ry_sq - rx_sq * y1p_sq - ry_sq * x1p_sq;
    if (radicant < 0) {
        radicant = 0;
    }
    radicant /= rx_sq * y1p_sq + ry_sq * x1p_sq;
    radicant = Math.sqrt(radicant) * (largeArcFlag === sweepFlag ? -1 : 1);
    const cxp = radicant * rx / ry * y1p;
    const cyp = radicant * -ry / rx * x1p;
    const cx = cos_phi * cxp - sin_phi * cyp + (x1 + x2) / 2;
    const cy = sin_phi * cxp + cos_phi * cyp + (y1 + y2) / 2;
    const v1x = (x1p - cxp) / rx;
    const v1y = (y1p - cyp) / ry;
    const v2x = (-x1p - cxp) / rx;
    const v2y = (-y1p - cyp) / ry;
    const theta1 = unit_vector_angle(1, 0, v1x, v1y);
    let delta_theta = unit_vector_angle(v1x, v1y, v2x, v2y);
    if (sweepFlag === false && delta_theta > 0) {
        delta_theta -= TAU;
    }
    if (sweepFlag === true && delta_theta < 0) {
        delta_theta += TAU;
    }
    return [
        cx,
        cy,
        theta1,
        delta_theta
    ];
}
function arcToCircle({ x1, y1, x2, y2, largeArcFlag, sweepFlag, rx, ry, phi }) {
    const sin_phi = Math.sin(phi * TAU / 360);
    const cos_phi = Math.cos(phi * TAU / 360);
    const x1p = cos_phi * (x1 - x2) / 2 + sin_phi * (y1 - y2) / 2;
    const y1p = -sin_phi * (x1 - x2) / 2 + cos_phi * (y1 - y2) / 2;
    if (x1p === 0 && y1p === 0) {
        return [];
    }
    if (rx === 0 || ry === 0) {
        return [];
    }
    rx = Math.abs(rx);
    ry = Math.abs(ry);
    const lambda = x1p * x1p / (rx * rx) + y1p * y1p / (ry * ry);
    if (lambda > 1) {
        rx *= Math.sqrt(lambda);
        ry *= Math.sqrt(lambda);
    }
    const cc = get_arc_center({
        x1,
        y1,
        x2,
        y2,
        largeArcFlag,
        sweepFlag,
        rx,
        ry,
        sin_phi,
        cos_phi
    });
    const result = [];
    let theta1 = cc[2];
    let delta_theta = cc[3];
    const segments = Math.max(Math.ceil(Math.abs(delta_theta) / (TAU / 4)), 1);
    delta_theta /= segments;
    for(let i = 0; i < segments; i++){
        result.push(approximate_unit_arc(theta1, delta_theta));
        theta1 += delta_theta;
    }
    return result.map((curve)=>{
        for(let i = 0; i < curve.length; i += 2){
            let x = curve[i + 0];
            let y = curve[i + 1];
            x *= rx;
            y *= ry;
            const xp = cos_phi * x - sin_phi * y;
            const yp = sin_phi * x + cos_phi * y;
            curve[i + 0] = xp + cc[0];
            curve[i + 1] = yp + cc[1];
        }
        return curve;
    });
}
var removeATSHVQInstructions = (segments)=>{
    return iterateOverSegments({
        segments,
        iterate: ({ segment, prevSegment, x, y, cpX, cpY })=>{
            if (segment.type === "H") {
                return [
                    {
                        type: "L",
                        x: segment.x,
                        y
                    }
                ];
            }
            if (segment.type === "V") {
                return [
                    {
                        type: "L",
                        x,
                        y: segment.y
                    }
                ];
            }
            if (segment.type === "A") {
                const nextX = segment.x;
                const nextY = segment.y;
                const new_segments = arcToCircle({
                    x1: x,
                    y1: y,
                    x2: nextX,
                    y2: nextY,
                    largeArcFlag: segment.largeArcFlag,
                    sweepFlag: segment.sweepFlag,
                    rx: segment.rx,
                    ry: segment.ry,
                    phi: segment.xAxisRotation
                });
                if (new_segments.length === 0) {
                    return [
                        {
                            type: "L",
                            x: segment.x,
                            y: segment.y
                        }
                    ];
                }
                const result = new_segments.map((_s)=>{
                    return {
                        type: "C",
                        cp1x: _s[2],
                        cp1y: _s[3],
                        cp2x: _s[4],
                        cp2y: _s[5],
                        x: _s[6],
                        y: _s[7]
                    };
                });
                return result;
            }
            if (segment.type === "T") {
                let prevControlX = 0;
                let prevControlY = 0;
                if (prevSegment && (prevSegment.type === "Q" || prevSegment.type === "T")) {
                    prevControlX = cpX;
                    prevControlY = cpY;
                } else {
                    prevControlX = x;
                    prevControlY = y;
                }
                const vectorX = prevControlX - x;
                const vectorY = prevControlY - y;
                const newControlX = x - vectorX;
                const newControlY = y - vectorY;
                return [
                    convertQToCInstruction({
                        type: "Q",
                        cpx: newControlX,
                        cpy: newControlY,
                        x: segment.x,
                        y: segment.y
                    }, {
                        x,
                        y
                    })
                ];
            }
            if (segment.type === "S") {
                let prevControlX = 0;
                let prevControlY = 0;
                if (prevSegment && prevSegment.type === "C") {
                    prevControlX = prevSegment.cp2x;
                    prevControlY = prevSegment.cp2y;
                } else if (prevSegment && prevSegment.type === "S") {
                    prevControlX = prevSegment.cpx;
                    prevControlY = prevSegment.cpy;
                } else {
                    prevControlX = x;
                    prevControlY = y;
                }
                const vectorX = prevControlX - x;
                const vectorY = prevControlY - y;
                const newControlX = x - vectorX;
                const newControlY = y - vectorY;
                return [
                    {
                        type: "C",
                        cp1x: newControlX,
                        cp1y: newControlY,
                        cp2x: segment.cpx,
                        cp2y: segment.cpy,
                        x: segment.x,
                        y: segment.y
                    }
                ];
            }
            if (segment.type === "Q") {
                return [
                    convertQToCInstruction(segment, {
                        x,
                        y
                    })
                ];
            }
            return [
                segment
            ];
        }
    });
};
// src/serialize-instructions.ts
var serializeInstruction = (instruction)=>{
    if (instruction.type === "A") {
        return `A ${instruction.rx} ${instruction.ry} ${instruction.xAxisRotation} ${Number(instruction.largeArcFlag)} ${Number(instruction.sweepFlag)} ${instruction.x} ${instruction.y}`;
    }
    if (instruction.type === "a") {
        return `a ${instruction.rx} ${instruction.ry} ${instruction.xAxisRotation} ${Number(instruction.largeArcFlag)} ${Number(instruction.sweepFlag)} ${instruction.dx} ${instruction.dy}`;
    }
    if (instruction.type === "C") {
        return `C ${instruction.cp1x} ${instruction.cp1y} ${instruction.cp2x} ${instruction.cp2y} ${instruction.x} ${instruction.y}`;
    }
    if (instruction.type === "c") {
        return `c ${instruction.cp1dx} ${instruction.cp1dy} ${instruction.cp2dx} ${instruction.cp2dy} ${instruction.dx} ${instruction.dy}`;
    }
    if (instruction.type === "S") {
        return `S ${instruction.cpx} ${instruction.cpy} ${instruction.x} ${instruction.y}`;
    }
    if (instruction.type === "s") {
        return `s ${instruction.cpdx} ${instruction.cpdy} ${instruction.dx} ${instruction.dy}`;
    }
    if (instruction.type === "Q") {
        return `Q ${instruction.cpx} ${instruction.cpy} ${instruction.x} ${instruction.y}`;
    }
    if (instruction.type === "q") {
        return `q ${instruction.cpdx} ${instruction.cpdy} ${instruction.dx} ${instruction.dy}`;
    }
    if (instruction.type === "Z") {
        return "Z";
    }
    if (instruction.type === "H") {
        return `H ${instruction.x}`;
    }
    if (instruction.type === "h") {
        return `h ${instruction.dx}`;
    }
    if (instruction.type === "V") {
        return `V ${instruction.y}`;
    }
    if (instruction.type === "v") {
        return `v ${instruction.dy}`;
    }
    if (instruction.type === "L") {
        return `L ${instruction.x} ${instruction.y}`;
    }
    if (instruction.type === "l") {
        return `l ${instruction.dx} ${instruction.dy}`;
    }
    if (instruction.type === "M") {
        return `M ${instruction.x} ${instruction.y}`;
    }
    if (instruction.type === "m") {
        return `m ${instruction.dx} ${instruction.dy}`;
    }
    if (instruction.type === "T") {
        return `T ${instruction.x} ${instruction.y}`;
    }
    if (instruction.type === "t") {
        return `t ${instruction.dx} ${instruction.dy}`;
    }
    throw new Error(`Unknown instruction type: ${instruction.type}`);
};
var serializeInstructions = (path)=>{
    return path.map((p)=>{
        return serializeInstruction(p);
    }).join(" ");
};
// src/normalize-path.ts
var normalizeInstructions = (instructions)=>{
    const normalized = [];
    let x = 0;
    let y = 0;
    let moveX = 0;
    let moveY = 0;
    for(let i = 0; i < instructions.length; i++){
        const instruction = instructions[i];
        if (instruction.type === "M") {
            moveX = instruction.x;
            moveY = instruction.y;
        } else if (instruction.type === "m") {
            moveX += instruction.dx;
            moveY += instruction.dy;
        }
        if (instruction.type === "A" || instruction.type === "C" || instruction.type === "L" || instruction.type === "M" || instruction.type === "Q" || instruction.type === "S" || instruction.type === "T") {
            normalized.push(instruction);
            x = instruction.x;
            y = instruction.y;
            continue;
        }
        if (instruction.type === "a" || instruction.type === "c" || instruction.type === "l" || instruction.type === "m" || instruction.type === "q" || instruction.type === "s" || instruction.type === "t") {
            const currentX = x;
            const currentY = y;
            x += instruction.dx;
            y += instruction.dy;
            if (instruction.type === "a") {
                normalized.push({
                    type: "A",
                    largeArcFlag: instruction.largeArcFlag,
                    rx: instruction.rx,
                    ry: instruction.ry,
                    sweepFlag: instruction.sweepFlag,
                    xAxisRotation: instruction.xAxisRotation,
                    x,
                    y
                });
                continue;
            }
            if (instruction.type === "c") {
                normalized.push({
                    type: "C",
                    cp1x: instruction.cp1dx + currentX,
                    cp1y: instruction.cp1dy + currentY,
                    cp2x: instruction.cp2dx + currentX,
                    cp2y: instruction.cp2dy + currentY,
                    x,
                    y
                });
                continue;
            }
            if (instruction.type === "l") {
                normalized.push({
                    type: "L",
                    x,
                    y
                });
                continue;
            }
            if (instruction.type === "m") {
                normalized.push({
                    type: "M",
                    x,
                    y
                });
                continue;
            }
            if (instruction.type === "q") {
                normalized.push({
                    type: "Q",
                    cpx: instruction.cpdx + currentX,
                    cpy: instruction.cpdy + currentY,
                    x,
                    y
                });
                continue;
            }
            if (instruction.type === "s") {
                normalized.push({
                    type: "S",
                    cpx: instruction.cpdx + currentX,
                    cpy: instruction.cpdy + currentY,
                    x,
                    y
                });
                continue;
            }
            if (instruction.type === "t") {
                normalized.push({
                    type: "T",
                    x,
                    y
                });
                continue;
            }
        }
        if (instruction.type === "H") {
            normalized.push(instruction);
            x = instruction.x;
            continue;
        }
        if (instruction.type === "V") {
            normalized.push(instruction);
            y = instruction.y;
            continue;
        }
        if (instruction.type === "Z") {
            normalized.push(instruction);
            x = moveX;
            y = moveY;
            continue;
        }
        if (instruction.type === "h") {
            x += instruction.dx;
            normalized.push({
                type: "H",
                x
            });
            continue;
        }
        if (instruction.type === "v") {
            y += instruction.dy;
            normalized.push({
                type: "V",
                y
            });
            continue;
        }
        throw new Error("Unknown instruction type: " + instruction.type);
    }
    return normalized;
};
var normalizePath = (path)=>{
    const instructions = parsePath(path);
    const normalized = normalizeInstructions(instructions);
    return serializeInstructions(normalized);
};
// src/reduce-instructions.ts
var reduceInstructions = (instruction)=>{
    const simplified = normalizeInstructions(instruction);
    return removeATSHVQInstructions(simplified);
};
// src/cut-path.ts
var cutPath = (d, length2)=>{
    const parsed = parsePath(d);
    const reduced = reduceInstructions(parsed);
    const constructed = conductAnalysis(reduced);
    const newInstructions = [];
    let summedUpLength = 0;
    for (const segment of constructed){
        for (const instructionAndInfo of segment.instructionsAndInfo){
            if (summedUpLength + instructionAndInfo.length > length2) {
                const remainingLength = length2 - summedUpLength;
                const progress = remainingLength / instructionAndInfo.length;
                const cut = cutInstruction({
                    instruction: instructionAndInfo.instruction,
                    lastPoint: instructionAndInfo.startPoint,
                    progress
                });
                newInstructions.push(cut);
                return serializeInstructions(newInstructions);
            }
            summedUpLength += instructionAndInfo.length;
            newInstructions.push(instructionAndInfo.instruction);
            if (summedUpLength === length2) {
                return serializeInstructions(newInstructions);
            }
        }
    }
    return serializeInstructions(newInstructions);
};
// src/debug-path.ts
var debugPath = (d)=>{
    const instructions = normalizeInstructions(parsePath(d));
    return instructions.map((inst, i)=>{
        if (inst.type === "Z") {
            return null;
        }
        if (inst.type === "H" || inst.type === "V") {
            return null;
        }
        const topLeft = [
            inst.x - 5,
            inst.y - 5
        ];
        const topRight = [
            inst.x + 5,
            inst.y - 5
        ];
        const bottomLeft = [
            inst.x - 5,
            inst.y + 5
        ];
        const bottomRight = [
            inst.x + 5,
            inst.y + 5
        ];
        const triangle = [
            {
                type: "M",
                x: topLeft[0],
                y: topLeft[1]
            },
            {
                type: "L",
                x: topRight[0],
                y: topRight[1]
            },
            {
                type: "L",
                x: bottomRight[0],
                y: bottomRight[1]
            },
            {
                type: "L",
                x: bottomLeft[0],
                y: bottomLeft[1]
            },
            {
                type: "Z"
            }
        ];
        return {
            d: serializeInstructions(triangle),
            color: i === instructions.length - 1 ? "red" : inst.type === "M" ? "blue" : "green"
        };
    }).filter(Boolean);
};
// src/get-bounding-box.ts
var CBEZIER_MINMAX_EPSILON = 0.00000001;
function minmaxQ(A) {
    const min = Math.min(A[0], A[2]);
    const max = Math.max(A[0], A[2]);
    if (A[1] > A[0] ? A[2] >= A[1] : A[2] <= A[1]) {
        return [
            min,
            max
        ];
    }
    const E = (A[0] * A[2] - A[1] * A[1]) / (A[0] - 2 * A[1] + A[2]);
    return E < min ? [
        E,
        max
    ] : [
        min,
        E
    ];
}
function minmaxC(A) {
    const K = A[0] - 3 * A[1] + 3 * A[2] - A[3];
    if (Math.abs(K) < CBEZIER_MINMAX_EPSILON) {
        if (A[0] === A[3] && A[0] === A[1]) {
            return [
                A[0],
                A[3]
            ];
        }
        return minmaxQ([
            A[0],
            -0.5 * A[0] + 1.5 * A[1],
            A[0] - 3 * A[1] + 3 * A[2]
        ]);
    }
    const T = -A[0] * A[2] + A[0] * A[3] - A[1] * A[2] - A[1] * A[3] + A[1] * A[1] + A[2] * A[2];
    if (T <= 0) {
        return [
            Math.min(A[0], A[3]),
            Math.max(A[0], A[3])
        ];
    }
    const S = Math.sqrt(T);
    let min = Math.min(A[0], A[3]);
    let max = Math.max(A[0], A[3]);
    const L = A[0] - 2 * A[1] + A[2];
    for(let R = (L + S) / K, i = 1; i <= 2; R = (L - S) / K, i++){
        if (R > 0 && R < 1) {
            const Q = A[0] * (1 - R) * (1 - R) * (1 - R) + A[1] * 3 * (1 - R) * (1 - R) * R + A[2] * 3 * (1 - R) * R * R + A[3] * R * R * R;
            if (Q < min) {
                min = Q;
            }
            if (Q > max) {
                max = Q;
            }
        }
    }
    return [
        min,
        max
    ];
}
var getBoundingBoxFromInstructions = (instructions)=>{
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let x = 0;
    let y = 0;
    let lastMoveX = 0;
    let lastMoveY = 0;
    for (const seg of instructions){
        switch(seg.type){
            case "M":
                {
                    lastMoveX = seg.x;
                    lastMoveY = seg.y;
                    if (minX > seg.x) {
                        minX = seg.x;
                    }
                    if (minY > seg.y) {
                        minY = seg.y;
                    }
                    if (maxX < seg.x) {
                        maxX = seg.x;
                    }
                    if (maxY < seg.y) {
                        maxY = seg.y;
                    }
                    x = seg.x;
                    y = seg.y;
                    break;
                }
            case "L":
                {
                    if (minX > seg.x) {
                        minX = seg.x;
                    }
                    if (minY > seg.y) {
                        minY = seg.y;
                    }
                    if (maxX < seg.x) {
                        maxX = seg.x;
                    }
                    if (maxY < seg.y) {
                        maxY = seg.y;
                    }
                    x = seg.x;
                    y = seg.y;
                    break;
                }
            case "C":
                {
                    const cxMinMax = minmaxC([
                        x,
                        seg.cp1x,
                        seg.cp2x,
                        seg.x
                    ]);
                    if (minX > cxMinMax[0]) {
                        minX = cxMinMax[0];
                    }
                    if (maxX < cxMinMax[1]) {
                        maxX = cxMinMax[1];
                    }
                    const cyMinMax = minmaxC([
                        y,
                        seg.cp1y,
                        seg.cp2y,
                        seg.y
                    ]);
                    if (minY > cyMinMax[0]) {
                        minY = cyMinMax[0];
                    }
                    if (maxY < cyMinMax[1]) {
                        maxY = cyMinMax[1];
                    }
                    x = seg.x;
                    y = seg.y;
                    break;
                }
            case "Z":
                x = lastMoveX;
                y = lastMoveY;
                break;
            default:
                throw new Error(`Unknown instruction ${seg.type}`);
        }
    }
    return {
        x1: minX,
        y1: minY,
        x2: maxX,
        y2: maxY,
        viewBox: `${minX} ${minY} ${maxX - minX} ${maxY - minY}`,
        width: maxX - minX,
        height: maxY - minY
    };
};
var getBoundingBox = (d)=>{
    const parsed = parsePath(d);
    const unarced = removeATSHVQInstructions(normalizeInstructions(parsed));
    return getBoundingBoxFromInstructions(unarced);
};
// src/helpers/arc.ts
var mod = (x, m)=>{
    return (x % m + m) % m;
};
var toRadians = (angle)=>{
    return angle * (Math.PI / 180);
};
var distance = (p0, p1)=>{
    return Math.sqrt((p1.x - p0.x) ** 2 + (p1.y - p0.y) ** 2);
};
var clamp = (val, min, max)=>{
    return Math.min(Math.max(val, min), max);
};
var angleBetween = (v0, v1)=>{
    const p = v0.x * v1.x + v0.y * v1.y;
    const n = Math.sqrt((v0.x ** 2 + v0.y ** 2) * (v1.x ** 2 + v1.y ** 2));
    const sign = v0.x * v1.y - v0.y * v1.x < 0 ? -1 : 1;
    const angle = sign * Math.acos(p / n);
    return angle;
};
var pointOnEllipticalArc = ({ p0, rx, ry, xAxisRotation, largeArcFlag, sweepFlag, p1, t })=>{
    rx = Math.abs(rx);
    ry = Math.abs(ry);
    xAxisRotation = mod(xAxisRotation, 360);
    const xAxisRotationRadians = toRadians(xAxisRotation);
    if (p0.x === p1.x && p0.y === p1.y) {
        return {
            x: p0.x,
            y: p0.y,
            ellipticalArcAngle: 0
        };
    }
    if (rx === 0 || ry === 0) {
        return {
            x: 0,
            y: 0,
            ellipticalArcAngle: 0
        };
    }
    const dx = (p0.x - p1.x) / 2;
    const dy = (p0.y - p1.y) / 2;
    const transformedPoint = {
        x: Math.cos(xAxisRotationRadians) * dx + Math.sin(xAxisRotationRadians) * dy,
        y: -Math.sin(xAxisRotationRadians) * dx + Math.cos(xAxisRotationRadians) * dy
    };
    const radiiCheck = transformedPoint.x ** 2 / rx ** 2 + transformedPoint.y ** 2 / ry ** 2;
    if (radiiCheck > 1) {
        rx *= Math.sqrt(radiiCheck);
        ry *= Math.sqrt(radiiCheck);
    }
    const cSquareNumerator = rx ** 2 * ry ** 2 - rx ** 2 * transformedPoint.y ** 2 - ry ** 2 * transformedPoint.x ** 2;
    const cSquareRootDenom = rx ** 2 * transformedPoint.y ** 2 + ry ** 2 * transformedPoint.x ** 2;
    let cRadicand = cSquareNumerator / cSquareRootDenom;
    cRadicand = cRadicand < 0 ? 0 : cRadicand;
    const cCoef = (largeArcFlag === sweepFlag ? -1 : 1) * Math.sqrt(cRadicand);
    const transformedCenter = {
        x: cCoef * (rx * transformedPoint.y / ry),
        y: cCoef * (-(ry * transformedPoint.x) / rx)
    };
    const center = {
        x: Math.cos(xAxisRotationRadians) * transformedCenter.x - Math.sin(xAxisRotationRadians) * transformedCenter.y + (p0.x + p1.x) / 2,
        y: Math.sin(xAxisRotationRadians) * transformedCenter.x + Math.cos(xAxisRotationRadians) * transformedCenter.y + (p0.y + p1.y) / 2
    };
    const startVector = {
        x: (transformedPoint.x - transformedCenter.x) / rx,
        y: (transformedPoint.y - transformedCenter.y) / ry
    };
    const startAngle = angleBetween({
        x: 1,
        y: 0
    }, startVector);
    const endVector = {
        x: (-transformedPoint.x - transformedCenter.x) / rx,
        y: (-transformedPoint.y - transformedCenter.y) / ry
    };
    let sweepAngle = angleBetween(startVector, endVector);
    if (!sweepFlag && sweepAngle > 0) {
        sweepAngle -= 2 * Math.PI;
    } else if (sweepFlag && sweepAngle < 0) {
        sweepAngle += 2 * Math.PI;
    }
    sweepAngle %= 2 * Math.PI;
    const angle = startAngle + sweepAngle * t;
    const ellipseComponentX = rx * Math.cos(angle);
    const ellipseComponentY = ry * Math.sin(angle);
    const point = {
        x: Math.cos(xAxisRotationRadians) * ellipseComponentX - Math.sin(xAxisRotationRadians) * ellipseComponentY + center.x,
        y: Math.sin(xAxisRotationRadians) * ellipseComponentX + Math.cos(xAxisRotationRadians) * ellipseComponentY + center.y,
        ellipticalArcStartAngle: startAngle,
        ellipticalArcEndAngle: startAngle + sweepAngle,
        ellipticalArcAngle: angle,
        ellipticalArcCenter: center,
        resultantRx: rx,
        resultantRy: ry
    };
    return point;
};
var approximateArcLengthOfCurve = (resolution, pointOnCurveFunc)=>{
    resolution = resolution ? resolution : 500;
    let resultantArcLength = 0;
    const arcLengthMap = [];
    const approximationLines = [];
    let prevPoint = pointOnCurveFunc(0);
    let nextPoint;
    for(let i = 0; i < resolution; i++){
        const t = clamp(i * (1 / resolution), 0, 1);
        nextPoint = pointOnCurveFunc(t);
        resultantArcLength += distance(prevPoint, nextPoint);
        approximationLines.push([
            prevPoint,
            nextPoint
        ]);
        arcLengthMap.push({
            t,
            arcLength: resultantArcLength
        });
        prevPoint = nextPoint;
    }
    nextPoint = pointOnCurveFunc(1);
    approximationLines.push([
        prevPoint,
        nextPoint
    ]);
    resultantArcLength += distance(prevPoint, nextPoint);
    arcLengthMap.push({
        t: 1,
        arcLength: resultantArcLength
    });
    return {
        arcLength: resultantArcLength,
        arcLengthMap,
        approximationLines
    };
};
var makeArc = ({ x0, y0, rx, ry, xAxisRotate, LargeArcFlag, SweepFlag, x1, y1 })=>{
    const lengthProperties = approximateArcLengthOfCurve(300, (t)=>{
        return pointOnEllipticalArc({
            p0: {
                x: x0,
                y: y0
            },
            rx,
            ry,
            xAxisRotation: xAxisRotate,
            largeArcFlag: LargeArcFlag,
            sweepFlag: SweepFlag,
            p1: {
                x: x1,
                y: y1
            },
            t
        });
    });
    const length2 = lengthProperties.arcLength;
    const getPointAtLength = (fractionLength)=>{
        if (fractionLength < 0) {
            fractionLength = 0;
        } else if (fractionLength > length2) {
            fractionLength = length2;
        }
        const position = pointOnEllipticalArc({
            p0: {
                x: x0,
                y: y0
            },
            rx,
            ry,
            xAxisRotation: xAxisRotate,
            largeArcFlag: LargeArcFlag,
            sweepFlag: SweepFlag,
            p1: {
                x: x1,
                y: y1
            },
            t: fractionLength / length2
        });
        return {
            x: position.x,
            y: position.y
        };
    };
    return {
        getPointAtLength,
        getTangentAtLength: (fractionLength)=>{
            if (fractionLength < 0) {
                fractionLength = 0;
            } else if (fractionLength > length2) {
                fractionLength = length2;
            }
            const point_dist = 0.05;
            const p1 = getPointAtLength(fractionLength);
            let p2;
            if (fractionLength < 0) {
                fractionLength = 0;
            } else if (fractionLength > length2) {
                fractionLength = length2;
            }
            if (fractionLength < length2 - point_dist) {
                p2 = getPointAtLength(fractionLength + point_dist);
            } else {
                p2 = getPointAtLength(fractionLength - point_dist);
            }
            const xDist = p2.x - p1.x;
            const yDist = p2.y - p1.y;
            const dist = Math.sqrt(xDist * xDist + yDist * yDist);
            if (fractionLength < length2 - point_dist) {
                return {
                    x: -xDist / dist,
                    y: -yDist / dist
                };
            }
            return {
                x: xDist / dist,
                y: yDist / dist
            };
        },
        getTotalLength: ()=>{
            return length2;
        },
        type: "arc"
    };
};
// src/helpers/construct.ts
var constructFromInstructions = (instructions)=>{
    let totalLength = 0;
    const partialLengths = [];
    const functions = [];
    let initialPoint = null;
    let cur = [
        0,
        0
    ];
    let prev_point = [
        0,
        0
    ];
    let curve;
    let ringStart = [
        0,
        0
    ];
    const segments = [];
    for(let i = 0; i < instructions.length; i++){
        const instruction = instructions[i];
        if (instruction.type !== "m" && instruction.type !== "M" && segments.length > 0) {
            segments[segments.length - 1].push(instruction);
        }
        if (instruction.type === "M") {
            cur = [
                instruction.x,
                instruction.y
            ];
            ringStart = [
                cur[0],
                cur[1]
            ];
            segments.push([
                instruction
            ]);
            functions.push(null);
            if (i === 0) {
                initialPoint = {
                    x: instruction.x,
                    y: instruction.y
                };
            }
        }
        if (instruction.type === "m") {
            cur = [
                instruction.dx + cur[0],
                instruction.dy + cur[1]
            ];
            ringStart = [
                cur[0],
                cur[1]
            ];
            segments.push([
                {
                    type: "M",
                    x: cur[0],
                    y: cur[1]
                }
            ]);
            functions.push(null);
        }
        if (instruction.type === "L") {
            totalLength += Math.sqrt((cur[0] - instruction.x) ** 2 + (cur[1] - instruction.y) ** 2);
            functions.push(makeLinearPosition({
                x0: cur[0],
                x1: instruction.x,
                y0: cur[1],
                y1: instruction.y
            }));
            cur = [
                instruction.x,
                instruction.y
            ];
        }
        if (instruction.type === "l") {
            totalLength += Math.sqrt(instruction.dx ** 2 + instruction.dy ** 2);
            functions.push(makeLinearPosition({
                x0: cur[0],
                x1: instruction.dx + cur[0],
                y0: cur[1],
                y1: instruction.dy + cur[1]
            }));
            cur = [
                instruction.dx + cur[0],
                instruction.dy + cur[1]
            ];
        }
        if (instruction.type === "H") {
            totalLength += Math.abs(cur[0] - instruction.x);
            functions.push(makeLinearPosition({
                x0: cur[0],
                x1: instruction.x,
                y0: cur[1],
                y1: cur[1]
            }));
            cur[0] = instruction.x;
        }
        if (instruction.type === "h") {
            totalLength += Math.abs(instruction.dx);
            functions.push(makeLinearPosition({
                x0: cur[0],
                x1: cur[0] + instruction.dx,
                y0: cur[1],
                y1: cur[1]
            }));
            cur[0] = instruction.dx + cur[0];
        } else if (instruction.type === "V") {
            totalLength += Math.abs(cur[1] - instruction.y);
            functions.push(makeLinearPosition({
                x0: cur[0],
                x1: cur[0],
                y0: cur[1],
                y1: instruction.y
            }));
            cur[1] = instruction.y;
        }
        if (instruction.type === "v") {
            totalLength += Math.abs(instruction.dy);
            functions.push(makeLinearPosition({
                x0: cur[0],
                x1: cur[0],
                y0: cur[1],
                y1: cur[1] + instruction.dy
            }));
            cur[1] = instruction.dy + cur[1];
        } else if (instruction.type === "Z") {
            totalLength += Math.sqrt((ringStart[0] - cur[0]) ** 2 + (ringStart[1] - cur[1]) ** 2);
            functions.push(makeLinearPosition({
                x0: cur[0],
                x1: ringStart[0],
                y0: cur[1],
                y1: ringStart[1]
            }));
            cur = [
                ringStart[0],
                ringStart[1]
            ];
        }
        if (instruction.type === "C") {
            curve = makeCubic({
                startX: cur[0],
                startY: cur[1],
                cp1x: instruction.cp1x,
                cp1y: instruction.cp1y,
                cp2x: instruction.cp2x,
                cp2y: instruction.cp2y,
                x: instruction.x,
                y: instruction.y
            });
            totalLength += curve.getTotalLength();
            cur = [
                instruction.x,
                instruction.y
            ];
            functions.push(curve);
        } else if (instruction.type === "c") {
            curve = makeCubic({
                startX: cur[0],
                startY: cur[1],
                cp1x: cur[0] + instruction.cp1dx,
                cp1y: cur[1] + instruction.cp1dy,
                cp2x: cur[0] + instruction.cp2dx,
                cp2y: cur[1] + instruction.cp2dy,
                x: cur[0] + instruction.dx,
                y: cur[1] + instruction.dy
            });
            if (curve.getTotalLength() > 0) {
                totalLength += curve.getTotalLength();
                functions.push(curve);
                cur = [
                    instruction.dx + cur[0],
                    instruction.dy + cur[1]
                ];
            } else {
                functions.push(makeLinearPosition({
                    x0: cur[0],
                    x1: cur[0],
                    y0: cur[1],
                    y1: cur[1]
                }));
            }
        }
        if (instruction.type === "S") {
            const prev = instructions[i - 1];
            const prevWasCurve = prev.type === "C" || prev.type === "c" || prev.type === "S" || prev.type === "s";
            if (i > 0 && prevWasCurve) {
                if (curve) {
                    const c = curve.getC();
                    curve = makeCubic({
                        startX: cur[0],
                        startY: cur[1],
                        cp1x: 2 * cur[0] - c.x,
                        cp1y: 2 * cur[1] - c.y,
                        cp2x: instruction.cpx,
                        cp2y: instruction.cpy,
                        x: instruction.x,
                        y: instruction.y
                    });
                }
            } else {
                curve = makeCubic({
                    startX: cur[0],
                    startY: cur[1],
                    cp1x: cur[0],
                    cp1y: cur[1],
                    cp2x: instruction.cpx,
                    cp2y: instruction.cpy,
                    x: instruction.x,
                    y: instruction.y
                });
            }
            if (curve) {
                totalLength += curve.getTotalLength();
                cur = [
                    instruction.x,
                    instruction.y
                ];
                functions.push(curve);
            }
        }
        if (instruction.type === "s") {
            const prev = instructions[i - 1];
            const prevWasCurve = prev.type === "C" || prev.type === "c" || prev.type === "S" || prev.type === "s";
            if (i > 0 && prevWasCurve) {
                if (curve) {
                    const c = curve.getC();
                    const d = curve.getD();
                    curve = makeCubic({
                        startX: cur[0],
                        startY: cur[1],
                        cp1x: cur[0] + d.x - c.x,
                        cp1y: cur[1] + d.y - c.y,
                        cp2x: cur[0] + instruction.cpdx,
                        cp2y: cur[1] + instruction.cpdy,
                        x: cur[0] + instruction.dx,
                        y: cur[1] + instruction.dy
                    });
                }
            } else {
                curve = makeCubic({
                    startX: cur[0],
                    startY: cur[1],
                    cp1x: cur[0],
                    cp1y: cur[1],
                    cp2x: cur[0] + instruction.cpdx,
                    cp2y: cur[1] + instruction.cpdy,
                    x: cur[0] + instruction.dx,
                    y: cur[1] + instruction.dy
                });
            }
            if (curve) {
                totalLength += curve.getTotalLength();
                cur = [
                    instruction.dx + cur[0],
                    instruction.dy + cur[1]
                ];
                functions.push(curve);
            }
        }
        if (instruction.type === "Q") {
            if (cur[0] === instruction.cpx && cur[1] === instruction.cpy) {
                const linearCurve = makeLinearPosition({
                    x0: instruction.cpx,
                    x1: instruction.x,
                    y0: instruction.cpy,
                    y1: instruction.y
                });
                totalLength += linearCurve.getTotalLength();
                functions.push(linearCurve);
            } else {
                curve = makeQuadratic({
                    startX: cur[0],
                    startY: cur[1],
                    cpx: instruction.cpx,
                    cpy: instruction.cpy,
                    x: instruction.x,
                    y: instruction.y
                });
                totalLength += curve.getTotalLength();
                functions.push(curve);
            }
            cur = [
                instruction.x,
                instruction.y
            ];
            prev_point = [
                instruction.cpx,
                instruction.cpy
            ];
        }
        if (instruction.type === "q") {
            if (instruction.cpdx === 0 && instruction.cpdy === 0) {
                const linearCurve = makeLinearPosition({
                    x0: cur[0] + instruction.cpdx,
                    x1: cur[0] + instruction.cpdy,
                    y0: cur[1] + instruction.dx,
                    y1: cur[1] + instruction.dy
                });
                totalLength += linearCurve.getTotalLength();
                functions.push(linearCurve);
            } else {
                curve = makeQuadratic({
                    startX: cur[0],
                    startY: cur[1],
                    cpx: cur[0] + instruction.cpdx,
                    cpy: cur[1] + instruction.cpdy,
                    x: cur[0] + instruction.dx,
                    y: cur[1] + instruction.dy
                });
                totalLength += curve.getTotalLength();
                functions.push(curve);
            }
            prev_point = [
                cur[0] + instruction.cpdx,
                cur[1] + instruction.cpdy
            ];
            cur = [
                instruction.dx + cur[0],
                instruction.dy + cur[1]
            ];
        }
        if (instruction.type === "T") {
            const prev = instructions[i - 1];
            const prevWasQ = prev.type === "Q" || prev.type === "q" || prev.type === "T" || prev.type === "t";
            if (i > 0 && prevWasQ) {
                curve = makeQuadratic({
                    startX: cur[0],
                    startY: cur[1],
                    cpx: 2 * cur[0] - prev_point[0],
                    cpy: 2 * cur[1] - prev_point[1],
                    x: instruction.x,
                    y: instruction.y
                });
                functions.push(curve);
                totalLength += curve.getTotalLength();
            } else {
                const linearCurve = makeLinearPosition({
                    x0: cur[0],
                    x1: instruction.x,
                    y0: cur[1],
                    y1: instruction.y
                });
                functions.push(linearCurve);
                totalLength += linearCurve.getTotalLength();
            }
            prev_point = [
                2 * cur[0] - prev_point[0],
                2 * cur[1] - prev_point[1]
            ];
            cur = [
                instruction.x,
                instruction.y
            ];
        }
        if (instruction.type === "t") {
            const prev = instructions[i - 1];
            const prevWasQ = prev.type === "Q" || prev.type === "q" || prev.type === "T" || prev.type === "t";
            if (i > 0 && prevWasQ) {
                curve = makeQuadratic({
                    startX: cur[0],
                    startY: cur[1],
                    cpx: 2 * cur[0] - prev_point[0],
                    cpy: 2 * cur[1] - prev_point[1],
                    x: cur[0] + instruction.dx,
                    y: cur[1] + instruction.dy
                });
                totalLength += curve.getTotalLength();
                functions.push(curve);
            } else {
                const linearCurve = makeLinearPosition({
                    x0: cur[0],
                    x1: cur[0] + instruction.dx,
                    y0: cur[1],
                    y1: cur[1] + instruction.dy
                });
                totalLength += linearCurve.getTotalLength();
                functions.push(linearCurve);
            }
            prev_point = [
                2 * cur[0] - prev_point[0],
                2 * cur[1] - prev_point[1]
            ];
            cur = [
                instruction.dx + cur[0],
                instruction.dy + cur[1]
            ];
        }
        if (instruction.type === "A") {
            const arcCurve = makeArc({
                x0: cur[0],
                y0: cur[1],
                rx: instruction.rx,
                ry: instruction.ry,
                xAxisRotate: instruction.xAxisRotation,
                LargeArcFlag: instruction.largeArcFlag,
                SweepFlag: instruction.sweepFlag,
                x1: instruction.x,
                y1: instruction.y
            });
            totalLength += arcCurve.getTotalLength();
            cur = [
                instruction.x,
                instruction.y
            ];
            functions.push(arcCurve);
        }
        if (instruction.type === "a") {
            const arcCurve = makeArc({
                x0: cur[0],
                y0: cur[1],
                rx: instruction.rx,
                ry: instruction.ry,
                xAxisRotate: instruction.xAxisRotation,
                LargeArcFlag: instruction.largeArcFlag,
                SweepFlag: instruction.sweepFlag,
                x1: cur[0] + instruction.dx,
                y1: cur[1] + instruction.dy
            });
            totalLength += arcCurve.getTotalLength();
            cur = [
                cur[0] + instruction.dx,
                cur[1] + instruction.dy
            ];
            functions.push(arcCurve);
        }
        partialLengths.push(totalLength);
    }
    return {
        segments,
        initialPoint,
        totalLength,
        partialLengths,
        functions
    };
};
var construct = (string)=>{
    const parsed = parsePath(string);
    return constructFromInstructions(parsed);
};
// src/get-length.ts
var getLength = (path)=>{
    const constructucted = construct(path);
    return constructucted.totalLength;
};
// src/evolve-path.ts
var evolvePath = (progress, path)=>{
    const length2 = getLength(path);
    if (progress === 0) {
        const extendedLength = length2 * 1.5;
        return {
            strokeDasharray: `${extendedLength} ${extendedLength}`,
            strokeDashoffset: extendedLength
        };
    }
    const strokeDasharray = `${length2} ${length2}`;
    const strokeDashoffset = length2 - progress * length2;
    return {
        strokeDasharray,
        strokeDashoffset
    };
};
// src/extend-viewbox.ts
var extendViewBox = (currentViewBox, scale)=>{
    const relativeScale = scale - 1;
    const splitted = currentViewBox.split(" ").map((a)=>a.trim()).filter((a)=>a !== "").map(Number);
    if (splitted.length !== 4) {
        throw new Error(`currentViewBox must be 4 valid numbers, but got "${currentViewBox}"`);
    }
    for (const part of splitted){
        if (Number.isNaN(part)) {
            throw new Error(`currentViewBox must be 4 valid numbers, but got "${currentViewBox}"`);
        }
        if (!Number.isFinite(part)) {
            throw new Error(`currentViewBox must be 4 valid numbers, but got "${currentViewBox}"`);
        }
    }
    const [x, y, width, height] = splitted;
    return [
        x - relativeScale * width / 2,
        y - relativeScale * height / 2,
        width + relativeScale * width,
        height + relativeScale * height
    ].join(" ");
};
// src/get-instruction-index-at-length.ts
var getInstructionIndexAtLengthFromConstructed = (constructed, fractionLength)=>{
    if (fractionLength < 0) {
        throw new Error("Length less than 0 was passed");
    }
    if (fractionLength > constructed.totalLength) {
        fractionLength = constructed.totalLength;
    }
    let index = constructed.partialLengths.length - 1;
    while(constructed.partialLengths[index] >= fractionLength && index > 0){
        index--;
    }
    return {
        lengthIntoInstruction: fractionLength - constructed.partialLengths[index],
        index
    };
};
var getInstructionIndexAtLength = (path, length2)=>{
    const constructed = construct(path);
    if (length2 > constructed.totalLength) {
        throw new Error(`A length of ${length2} was passed to getInstructionIndexAtLength() but the total length of the path is only ${constructed.totalLength}`);
    }
    return getInstructionIndexAtLengthFromConstructed(constructed, length2);
};
// src/get-point-at-length.ts
var getPointAtLength = (path, length2)=>{
    const constructed = construct(path);
    const fractionPart = getInstructionIndexAtLengthFromConstructed(constructed, length2);
    const functionAtPart = constructed.functions[fractionPart.index + 1];
    if (functionAtPart) {
        return functionAtPart.getPointAtLength(fractionPart.lengthIntoInstruction);
    }
    if (constructed.initialPoint) {
        return constructed.initialPoint;
    }
    throw new Error("Wrong function at this part.");
};
// src/get-subpaths.ts
var getSubpaths = (path)=>{
    const parsed = parsePath(path);
    const { segments } = constructFromInstructions(parsed);
    return segments.map((seg)=>{
        return serializeInstructions(seg);
    });
};
// src/get-tangent-at-length.ts
var getTangentAtLength = (path, length2)=>{
    const constructed = construct(path);
    const fractionPart = getInstructionIndexAtLengthFromConstructed(constructed, length2);
    const functionAtPart = constructed.functions[fractionPart.index + 1];
    if (functionAtPart) {
        return functionAtPart.getTangentAtLength(fractionPart.lengthIntoInstruction);
    }
    if (constructed.initialPoint) {
        return {
            x: 0,
            y: 0
        };
    }
    throw new Error("Wrong function at this part.");
};
// src/get-end-position.ts
var getEndPosition = (instructions)=>{
    let x = 0;
    let y = 0;
    let moveX = 0;
    let moveY = 0;
    for(let i = 0; i < instructions.length; i++){
        const instruction = instructions[i];
        if (instruction.type === "M") {
            moveX = instruction.x;
            moveY = instruction.y;
        } else if (instruction.type === "m") {
            moveX += instruction.dx;
            moveY += instruction.dy;
        }
        if (instruction.type === "A" || instruction.type === "C" || instruction.type === "L" || instruction.type === "M" || instruction.type === "Q" || instruction.type === "S" || instruction.type === "T") {
            x = instruction.x;
            y = instruction.y;
            continue;
        }
        if (instruction.type === "a" || instruction.type === "c" || instruction.type === "l" || instruction.type === "m" || instruction.type === "q" || instruction.type === "s" || instruction.type === "t") {
            x += instruction.dx;
            y += instruction.dy;
            continue;
        }
        if (instruction.type === "H") {
            x = instruction.x;
            continue;
        }
        if (instruction.type === "V") {
            y = instruction.y;
            continue;
        }
        if (instruction.type === "Z") {
            x = moveX;
            y = moveY;
            continue;
        }
        if (instruction.type === "h") {
            x += instruction.dx;
            continue;
        }
        if (instruction.type === "v") {
            y += instruction.dy;
            continue;
        }
        throw new Error("Unknown instruction type: " + instruction.type);
    }
    return {
        x,
        y
    };
};
// src/interpolate-path/convert-to-same-instruction-type.ts
var convertToLCommand = (command)=>{
    if (command.type === "M" || command.type === "L" || command.type === "Z") {
        throw new Error("unexpected");
    }
    return {
        type: "L",
        x: command.x,
        y: command.y
    };
};
var convertToCCommand = (command, currentPoint)=>{
    if (command.type === "M" || command.type === "C" || command.type === "Z") {
        throw new Error("unexpected");
    }
    if (command.type === "L") {
        return {
            type: "C",
            cp1x: currentPoint.x,
            cp1y: currentPoint.y,
            cp2x: command.x,
            cp2y: command.y,
            x: command.x,
            y: command.y
        };
    }
    throw new Error("all types should be handled");
};
function convertToSameInstructionType(aCommand, bCommand, currentPoint) {
    if (aCommand.type === "M" || bCommand.type === "M") {
        return {
            ...aCommand
        };
    }
    if (aCommand.type === bCommand.type) {
        return {
            ...aCommand
        };
    }
    if (bCommand.type === "C") {
        return convertToCCommand(aCommand, currentPoint);
    }
    if (bCommand.type === "L") {
        return convertToLCommand(aCommand);
    }
    if (bCommand.type === "Z") {
        return {
            type: "Z"
        };
    }
    throw new TypeError("unhandled");
}
// src/interpolate-path/points-to-command.ts
function pointsToInstruction(points) {
    const x = points[points.length - 1][0];
    const y = points[points.length - 1][1];
    if (points.length === 4) {
        const x1 = points[1][0];
        const y1 = points[1][1];
        const x2 = points[2][0];
        const y2 = points[2][1];
        return {
            type: "C",
            cp1x: x1,
            cp1y: y1,
            cp2x: x2,
            cp2y: y2,
            x,
            y
        };
    }
    if (points.length === 3) {
        const x1 = points[1][0];
        const y1 = points[1][1];
        return convertQToCInstruction({
            type: "Q",
            cpx: x1,
            cpy: y1,
            x,
            y
        }, {
            x: points[0][0],
            y: points[0][1]
        });
    }
    return {
        type: "L",
        x,
        y
    };
}
// src/interpolate-path/de-casteljau.ts
function decasteljau(points, t) {
    const left = [];
    const right = [];
    function decasteljauRecurse(_points, _t) {
        if (_points.length === 1) {
            left.push(_points[0]);
            right.push(_points[0]);
        } else {
            const newPoints = Array(_points.length - 1);
            for(let i = 0; i < newPoints.length; i++){
                if (i === 0) {
                    left.push(_points[0]);
                }
                if (i === newPoints.length - 1) {
                    right.push(_points[i + 1]);
                }
                newPoints[i] = [
                    (1 - _t) * _points[i][0] + _t * _points[i + 1][0],
                    (1 - _t) * _points[i][1] + _t * _points[i + 1][1]
                ];
            }
            decasteljauRecurse(newPoints, _t);
        }
    }
    if (points.length) {
        decasteljauRecurse(points, t);
    }
    return {
        left,
        right: right.reverse()
    };
}
// src/interpolate-path/split-curve-as-points.ts
function splitCurveAsPoints(points, segmentCount = 2) {
    const segments = [];
    let remainingCurve = points;
    const tIncrement = 1 / segmentCount;
    for(let i = 0; i < segmentCount - 1; i++){
        const tRelative = tIncrement / (1 - tIncrement * i);
        const split = decasteljau(remainingCurve, tRelative);
        segments.push(split.left);
        remainingCurve = split.right;
    }
    segments.push(remainingCurve);
    return segments;
}
// src/interpolate-path/split-curve.ts
var splitCurveInstructions = (instructionStartX, instructionStartY, instructionEnd, segmentCount)=>{
    const points = [
        [
            instructionStartX,
            instructionStartY
        ]
    ];
    if (instructionEnd.type === "Q") {
        points.push([
            instructionEnd.cpx,
            instructionEnd.cpy
        ]);
    }
    if (instructionEnd.type === "C") {
        points.push([
            instructionEnd.cp1x,
            instructionEnd.cp1y
        ]);
        points.push([
            instructionEnd.cp2x,
            instructionEnd.cp2y
        ]);
    }
    points.push([
        instructionEnd.x,
        instructionEnd.y
    ]);
    return splitCurveAsPoints(points, segmentCount).map((p)=>{
        return pointsToInstruction(p);
    });
};
// src/interpolate-path/split-segment.ts
function splitSegmentInstructions(commandStart, commandEnd, segmentCount) {
    let segments = [];
    if (commandEnd.type === "L" || commandEnd.type === "C") {
        if (commandStart.type !== "Z") {
            segments = segments.concat(splitCurveInstructions(commandStart.x, commandStart.y, commandEnd, segmentCount));
        }
    } else {
        const copyCommand = commandStart.type === "M" ? {
            type: "L",
            x: commandStart.x,
            y: commandStart.y
        } : commandStart;
        segments = segments.concat(new Array(segmentCount - 1).fill(true).map(()=>copyCommand));
        segments.push(commandEnd);
    }
    return segments;
}
// src/interpolate-path/extend-command.ts
function extendInstruction(commandsToExtend, referenceCommands) {
    const numSegmentsToExtend = commandsToExtend.length - 1;
    const numReferenceSegments = referenceCommands.length - 1;
    const segmentRatio = numSegmentsToExtend / numReferenceSegments;
    const countPointsPerSegment = new Array(numReferenceSegments).fill(undefined).reduce((accum, _d, i)=>{
        const insertIndex = Math.floor(segmentRatio * i);
        accum[insertIndex] = (accum[insertIndex] || 0) + 1;
        return accum;
    }, []);
    const extended = countPointsPerSegment.reduce((_extended, segmentCount, i)=>{
        if (i === commandsToExtend.length - 1) {
            const lastCommandCopies = new Array(segmentCount).fill({
                ...commandsToExtend[commandsToExtend.length - 1]
            });
            if (lastCommandCopies[0].type === "M") {
                lastCommandCopies.forEach((d)=>{
                    d.type = "L";
                });
            }
            return _extended.concat(lastCommandCopies);
        }
        return _extended.concat(splitSegmentInstructions(commandsToExtend[i], commandsToExtend[i + 1], segmentCount));
    }, []);
    extended.unshift(commandsToExtend[0]);
    return extended;
}
// src/interpolate-path/interpolate-instruction-of-same-kind.ts
var interpolateLInstruction = (t, first, second)=>{
    return {
        type: "L",
        x: (1 - t) * first.x + t * second.x,
        y: (1 - t) * first.y + t * second.y
    };
};
var interpolateCInstructions = (t, first, second)=>{
    return {
        type: "C",
        cp1x: (1 - t) * first.cp1x + t * second.cp1x,
        cp2x: (1 - t) * first.cp2x + t * second.cp2x,
        cp1y: (1 - t) * first.cp1y + t * second.cp1y,
        cp2y: (1 - t) * first.cp2y + t * second.cp2y,
        x: (1 - t) * first.x + t * second.x,
        y: (1 - t) * first.y + t * second.y
    };
};
var interpolateMInstructions = (t, first, second)=>{
    return {
        type: "M",
        x: (1 - t) * first.x + t * second.x,
        y: (1 - t) * first.y + t * second.y
    };
};
var interpolateInstructionOfSameKind = (t, first, second)=>{
    if (first.type === "L") {
        if (second.type !== "L") {
            throw new Error("mismatch");
        }
        return interpolateLInstruction(t, first, second);
    }
    if (first.type === "C") {
        if (second.type !== "C") {
            throw new Error("mismatch");
        }
        return interpolateCInstructions(t, first, second);
    }
    if (first.type === "M") {
        if (second.type !== "M") {
            throw new Error("mismatch");
        }
        return interpolateMInstructions(t, first, second);
    }
    if (first.type === "Z") {
        if (second.type !== "Z") {
            throw new Error("mismatch");
        }
        return {
            type: "Z"
        };
    }
    throw new Error("mismatch");
};
// src/interpolate-path/interpolate-instructions.ts
function interpolateInstructions(aCommandsInput, bCommandsInput) {
    let aCommands = aCommandsInput.slice();
    let bCommands = bCommandsInput.slice();
    if (!aCommands.length && !bCommands.length) {
        return function() {
            return [];
        };
    }
    const addZ = (aCommands.length === 0 || aCommands[aCommands.length - 1].type === "Z") && (bCommands.length === 0 || bCommands[bCommands.length - 1].type === "Z");
    if (aCommands.length > 0 && aCommands[aCommands.length - 1].type === "Z") {
        aCommands.pop();
    }
    if (bCommands.length > 0 && bCommands[bCommands.length - 1].type === "Z") {
        bCommands.pop();
    }
    if (!aCommands.length) {
        aCommands.push(bCommands[0]);
    } else if (!bCommands.length) {
        bCommands.push(aCommands[0]);
    }
    const numPointsToExtend = Math.abs(bCommands.length - aCommands.length);
    if (numPointsToExtend !== 0) {
        if (bCommands.length > aCommands.length) {
            aCommands = extendInstruction(aCommands, bCommands);
        } else if (bCommands.length < aCommands.length) {
            bCommands = extendInstruction(bCommands, aCommands);
        }
    }
    const aSameType = aCommands.map((aCommand, i)=>{
        const commandsUntilNow = aCommands.slice(0, i);
        const point = getEndPosition(commandsUntilNow);
        return convertToSameInstructionType(aCommand, bCommands[i], point);
    });
    const interpolatedCommands = [];
    if (addZ) {
        aSameType.push({
            type: "Z"
        });
        bCommands.push({
            type: "Z"
        });
    }
    return function(t) {
        if (t === 1) {
            return bCommandsInput;
        }
        if (t === 0) {
            return aSameType;
        }
        for(let i = 0; i < aSameType.length; ++i){
            interpolatedCommands.push(interpolateInstructionOfSameKind(t, aSameType[i], bCommands[i]));
        }
        return interpolatedCommands;
    };
}
// src/interpolate-path/interpolate-path.ts
var interpolatePath = (value, firstPath, secondPath)=>{
    if (value === 1) {
        return secondPath;
    }
    if (value === 0) {
        return firstPath;
    }
    const aCommands = reduceInstructions(parsePath(firstPath));
    if (aCommands.length === 0) {
        throw new TypeError(`SVG Path "${firstPath}" is not valid`);
    }
    const bCommands = reduceInstructions(parsePath(secondPath));
    if (bCommands.length === 0) {
        throw new TypeError(`SVG Path "${secondPath}" is not valid`);
    }
    const commandInterpolator = interpolateInstructions(aCommands, bCommands);
    return serializeInstructions(commandInterpolator(value));
};
// src/translate-path.ts
var translateSegments = (segments, x, y)=>{
    return segments.map((segment)=>{
        if (segment.type === "a" || segment.type === "c" || segment.type === "v" || segment.type === "s" || segment.type === "h" || segment.type === "l" || segment.type === "m" || segment.type === "q" || segment.type === "t") {
            return segment;
        }
        if (segment.type === "V") {
            return {
                type: "V",
                y: segment.y + y
            };
        }
        if (segment.type === "H") {
            return {
                type: "H",
                x: segment.x + x
            };
        }
        if (segment.type === "A") {
            return {
                type: "A",
                rx: segment.rx,
                ry: segment.ry,
                largeArcFlag: segment.largeArcFlag,
                sweepFlag: segment.sweepFlag,
                xAxisRotation: segment.xAxisRotation,
                x: segment.x + x,
                y: segment.y + y
            };
        }
        if (segment.type === "Z") {
            return segment;
        }
        if (segment.type === "C") {
            return {
                type: "C",
                cp1x: segment.cp1x + x,
                cp1y: segment.cp1y + y,
                cp2x: segment.cp2x + x,
                cp2y: segment.cp2y + y,
                x: segment.x + x,
                y: segment.y + y
            };
        }
        if (segment.type === "Q") {
            return {
                type: "Q",
                cpx: segment.cpx + x,
                cpy: segment.cpy + y,
                x: segment.x + x,
                y: segment.y + y
            };
        }
        if (segment.type === "S") {
            return {
                type: "S",
                cpx: segment.cpx + x,
                cpy: segment.cpy + y,
                x: segment.x + x,
                y: segment.y + y
            };
        }
        if (segment.type === "T") {
            return {
                type: "T",
                x: segment.x + x,
                y: segment.y + y
            };
        }
        if (segment.type === "L") {
            return {
                type: "L",
                x: segment.x + x,
                y: segment.y + y
            };
        }
        if (segment.type === "M") {
            return {
                type: "M",
                x: segment.x + x,
                y: segment.y + y
            };
        }
        throw new Error(`Unknown segment type: ${segment.type}`);
    });
};
var translatePath = (path, x, y)=>{
    return serializeInstructions(translateSegments(parsePath(path), x, y));
};
// src/reset-path.ts
var resetPath = (d)=>{
    const box = getBoundingBox(d);
    return translatePath(d, -box.x1, -box.y1);
};
// src/reverse-path.ts
function reverseNormalizedPath(instructions) {
    const reversed = [];
    let nextX = 0;
    let nextY = 0;
    for (const term of instructions){
        if (term.type === "A") {
            reversed.unshift({
                type: "A",
                largeArcFlag: term.largeArcFlag,
                rx: term.rx,
                ry: term.ry,
                xAxisRotation: term.xAxisRotation,
                sweepFlag: !term.sweepFlag,
                x: nextX,
                y: nextY
            });
        } else if (term.type === "C") {
            reversed.unshift({
                type: "C",
                cp1x: term.cp2x,
                cp1y: term.cp2y,
                cp2x: term.cp1x,
                cp2y: term.cp1y,
                x: nextX,
                y: nextY
            });
        } else if (term.type === "Q") {
            reversed.unshift({
                type: "Q",
                cpx: term.cpx,
                cpy: term.cpy,
                x: nextX,
                y: nextY
            });
        } else if (term.type === "L") {
            reversed.unshift({
                type: "L",
                x: nextX,
                y: nextY
            });
        } else if (term.type === "M") {} else if (term.type === "Z") {} else {
            throw new Error("unnormalized instruction " + term.type);
        }
        if (term.type !== "Z") {
            nextX = term.x;
            nextY = term.y;
        }
    }
    reversed.unshift({
        type: "M",
        x: nextX,
        y: nextY
    });
    let revstring = serializeInstructions(reversed);
    if (instructions[instructions.length - 1].type === "Z") revstring += "Z";
    revstring = revstring.replace(/M M/g, "Z M");
    return revstring;
}
var reversePath = (path)=>{
    const parsed = parsePath(path);
    const normalized = normalizeInstructions(parsed);
    const reduced = reduceInstructions(normalized);
    const { segments } = constructFromInstructions(reduced);
    return segments.map((spath)=>{
        return reverseNormalizedPath(spath);
    }).join(" ").replace(/ +/g, " ").trim();
};
// src/scale-path.ts
var scalePath = (d, scaleX, scaleY)=>{
    const reduced = reduceInstructions(parsePath(d));
    const bounded = getBoundingBoxFromInstructions(reduced);
    const zeroed = translateSegments(reduced, -bounded.x1, -bounded.y1);
    const mapped = zeroed.map((instruction)=>{
        if (instruction.type === "L") {
            return {
                type: "L",
                x: scaleX * instruction.x,
                y: scaleY * instruction.y
            };
        }
        if (instruction.type === "C") {
            return {
                type: "C",
                x: scaleX * instruction.x,
                y: scaleY * instruction.y,
                cp1x: scaleX * instruction.cp1x,
                cp1y: scaleY * instruction.cp1y,
                cp2x: scaleX * instruction.cp2x,
                cp2y: scaleY * instruction.cp2y
            };
        }
        if (instruction.type === "M") {
            return {
                type: "M",
                x: scaleX * instruction.x,
                y: scaleY * instruction.y
            };
        }
        if (instruction.type === "Q") {
            return {
                type: "Q",
                x: scaleX * instruction.x,
                y: scaleY * instruction.y,
                cpx: scaleX * instruction.cpx,
                cpy: scaleY * instruction.cpy
            };
        }
        if (instruction.type === "Z") {
            return {
                type: "Z"
            };
        }
        if (instruction.type === "A") {
            return {
                type: "A",
                largeArcFlag: instruction.largeArcFlag,
                rx: scaleX * instruction.rx,
                ry: scaleY * instruction.ry,
                sweepFlag: instruction.sweepFlag,
                xAxisRotation: instruction.xAxisRotation,
                x: scaleX * instruction.x,
                y: scaleY * instruction.y
            };
        }
        if (instruction.type === "H") {
            return {
                type: "H",
                x: scaleX * instruction.x
            };
        }
        if (instruction.type === "S") {
            return {
                type: "S",
                cpx: scaleX * instruction.cpx,
                cpy: scaleY * instruction.cpy,
                x: scaleX * instruction.x,
                y: scaleY * instruction.y
            };
        }
        if (instruction.type === "T") {
            return {
                type: "T",
                x: scaleX * instruction.x,
                y: scaleY * instruction.y
            };
        }
        if (instruction.type === "V") {
            return {
                type: "V",
                y: scaleY * instruction.y
            };
        }
        if (instruction.type === "a") {
            return {
                type: "a",
                dx: scaleX * instruction.dx,
                dy: scaleY * instruction.dy,
                largeArcFlag: instruction.largeArcFlag,
                rx: scaleX * instruction.rx,
                ry: scaleY * instruction.ry,
                sweepFlag: instruction.sweepFlag,
                xAxisRotation: instruction.xAxisRotation
            };
        }
        if (instruction.type === "c") {
            return {
                type: "c",
                cp1dx: scaleX * instruction.cp1dx,
                cp1dy: scaleY * instruction.cp1dy,
                cp2dx: scaleX * instruction.cp2dx,
                cp2dy: scaleY * instruction.cp2dy,
                dx: scaleX * instruction.dx,
                dy: scaleY * instruction.dy
            };
        }
        if (instruction.type === "h") {
            return {
                type: "h",
                dx: scaleX * instruction.dx
            };
        }
        if (instruction.type === "l") {
            return {
                type: "l",
                dx: scaleX * instruction.dx,
                dy: scaleY * instruction.dy
            };
        }
        if (instruction.type === "m") {
            return {
                type: "m",
                dx: scaleX * instruction.dx,
                dy: scaleY * instruction.dy
            };
        }
        if (instruction.type === "q") {
            return {
                type: "q",
                cpdx: scaleX * instruction.cpdx,
                cpdy: scaleY * instruction.cpdy,
                dx: scaleX * instruction.dx,
                dy: scaleY * instruction.dy
            };
        }
        if (instruction.type === "s") {
            return {
                type: "s",
                cpdx: scaleX * instruction.cpdx,
                cpdy: scaleY * instruction.cpdy,
                dx: scaleX * instruction.dx,
                dy: scaleY * instruction.dy
            };
        }
        if (instruction.type === "t") {
            return {
                type: "t",
                dx: scaleX * instruction.dx,
                dy: scaleY * instruction.dy
            };
        }
        if (instruction.type === "v") {
            return {
                type: "v",
                dy: scaleY * instruction.dy
            };
        }
        throw new Error("unexpected function");
    });
    return serializeInstructions(translateSegments(mapped, bounded.x1, bounded.y1));
};
// src/warp-path/warp-helpers.ts
var euclideanDistance = (points)=>{
    const startPoint = points[0];
    const endPoint = points[points.length - 1];
    let d2 = 0;
    for(let i = 0; i < startPoint.length; i++){
        const d = endPoint[i] - startPoint[i];
        d2 += d ** 2;
    }
    return Math.sqrt(d2);
};
function split(p, t = 0.5) {
    const seg0 = [];
    const seg1 = [];
    const orders = [
        p
    ];
    while(orders.length < p.length){
        const q = orders[orders.length - 1];
        const r = [];
        for(let i = 1; i < q.length; i++){
            const q0 = q[i - 1];
            const q1 = q[i];
            const s = [];
            const dim = Math.max(q0.length, q1.length);
            for(let j = 0; j < dim; j++){
                const s0 = q0[j] || 0;
                const s1 = q1[j] || 0;
                s.push(s0 + (s1 - s0) * t);
            }
            r.push(s);
        }
        orders.push(r);
    }
    for(let i = 0; i < orders.length; i++){
        seg0.push(orders[i][0]);
        seg1.push(orders[orders.length - 1 - i][i]);
    }
    return [
        seg0,
        seg1
    ];
}
function interpolateUntil(points, threshold, deltaFunction = euclideanDistance) {
    const stack = [
        points
    ];
    const segments = [];
    while(stack.length > 0){
        const currentPoints = stack.pop();
        if (deltaFunction(currentPoints) > threshold) {
            const newPoints = split(currentPoints);
            for(let i = newPoints.length - 1; i >= 0; i--){
                stack.push(newPoints[i]);
            }
        } else {
            segments.push(currentPoints);
        }
    }
    return segments;
}
function createLineSegment(points) {
    switch(points.length){
        case 2:
            return {
                type: "L",
                x: points[1][0],
                y: points[1][1]
            };
        case 3:
            return convertQToCInstruction({
                type: "Q",
                cpx: points[1][0],
                cpy: points[1][1],
                x: points[2][0],
                y: points[2][1]
            }, {
                x: points[0][0],
                y: points[0][1]
            });
        case 4:
            return {
                type: "C",
                cp1x: points[1][0],
                cp1y: points[1][1],
                cp2x: points[2][0],
                cp2y: points[2][1],
                x: points[3][0],
                y: points[3][1]
            };
        default:
            throw new Error("Expected 2, 3 or 4 points for a line segment, got " + points.length);
    }
}
function warpInterpolate(path, threshold, deltaFunction) {
    let prexX = 0;
    let prexY = 0;
    return path.map((segment)=>{
        const points = [
            [
                prexX,
                prexY
            ]
        ];
        if (segment.type !== "Z") {
            prexX = segment.x;
            prexY = segment.y;
        }
        if (segment.type === "C") {
            points.push([
                segment.cp1x,
                segment.cp1y
            ]);
            points.push([
                segment.cp2x,
                segment.cp2y
            ]);
            points.push([
                segment.x,
                segment.y
            ]);
        }
        if (segment.type === "L") {
            points.push([
                segment.x,
                segment.y
            ]);
        }
        if (segment.type === "C" || segment.type === "L") {
            return interpolateUntil(points, threshold, deltaFunction).map((rawSegment)=>createLineSegment(rawSegment));
        }
        return [
            segment
        ];
    }).flat(1);
}
function svgPathInterpolate(path, threshold) {
    let didWork = false;
    const deltaFunction = (points)=>{
        const linearPoints = [
            points[0].slice(0, 2),
            points[points.length - 1].slice(0, 2)
        ];
        const delta = euclideanDistance(linearPoints);
        didWork = didWork || delta > threshold;
        return delta;
    };
    return warpInterpolate(path, threshold, deltaFunction);
}
var warpTransform = (path, transformer)=>{
    return path.map((segment)=>{
        if (segment.type === "L") {
            const { x, y } = transformer({
                x: segment.x,
                y: segment.y
            });
            return [
                {
                    type: "L",
                    x,
                    y
                }
            ];
        }
        if (segment.type === "C") {
            const { x, y } = transformer({
                x: segment.x,
                y: segment.y
            });
            const { x: cp1x, y: cp1y } = transformer({
                x: segment.cp1x,
                y: segment.cp1y
            });
            const { x: cp2x, y: cp2y } = transformer({
                x: segment.cp2x,
                y: segment.cp2y
            });
            return [
                {
                    type: "C",
                    x,
                    y,
                    cp1x,
                    cp1y,
                    cp2x,
                    cp2y
                }
            ];
        }
        if (segment.type === "M") {
            const { x, y } = transformer({
                x: segment.x,
                y: segment.y
            });
            return [
                {
                    type: "M",
                    x,
                    y
                }
            ];
        }
        return [
            segment
        ];
    }).flat(1);
};
var fixZInstruction = (instructions)=>{
    let prevX = 0;
    let prevY = 0;
    return instructions.map((instruction)=>{
        if (instruction.type === "Z") {
            return [
                {
                    type: "L",
                    x: prevX,
                    y: prevY
                },
                {
                    type: "Z"
                }
            ];
        }
        if (instruction.type === "M") {
            prevX = instruction.x;
            prevY = instruction.y;
        }
        return [
            instruction
        ];
    }).flat(1);
};
// src/warp-path/index.ts
var getDefaultInterpolationThreshold = (instructions)=>{
    const boundingBox = getBoundingBoxFromInstructions(instructions);
    const longer = Math.max(boundingBox.y2 - boundingBox.y1, boundingBox.x2 - boundingBox.x1);
    return longer * 0.01;
};
var warpPath = (path, transformer, options)=>{
    const reduced = reduceInstructions(parsePath(path));
    const withZFix = fixZInstruction(reduced);
    const interpolated = svgPathInterpolate(withZFix, options?.interpolationThreshold ?? getDefaultInterpolationThreshold(withZFix));
    return serializeInstructions(warpTransform(interpolated, transformer));
};
// src/index.ts
var PathInternals = {
    getBoundingBoxFromInstructions,
    debugPath,
    cutPath
};
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/packages/google-fonts/dist/esm/Inter.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/base.ts
__turbopack_context__.s([
    "fontFamily",
    ()=>fontFamily,
    "getInfo",
    ()=>getInfo,
    "loadFont",
    ()=>loadFont
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/dist/esm/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$no$2d$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/dist/esm/no-react.mjs [app-client] (ecmascript)");
;
;
var loadedFonts = {};
var withResolvers = function() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej)=>{
        resolve = res;
        reject = rej;
    });
    return {
        promise,
        resolve,
        reject
    };
};
var loadFontFaceOrTimeoutAfter20Seconds = (fontFace)=>{
    const timeout = withResolvers();
    const int = setTimeout(()=>{
        timeout.reject(new Error("Timed out loading Google Font"));
    }, 18000);
    return Promise.race([
        fontFace.load().then(()=>{
            clearTimeout(int);
        }),
        timeout.promise
    ]);
};
var loadFonts = (meta, style, options)=>{
    const weightsAndSubsetsAreSpecified = Array.isArray(options?.weights) && Array.isArray(options?.subsets) && options.weights.length > 0 && options.subsets.length > 0;
    if (__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$no$2d$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NoReactInternals"].ENABLE_V5_BREAKING_CHANGES && !weightsAndSubsetsAreSpecified) {
        throw new Error("Loading Google Fonts without specifying weights and subsets is not supported in Remotion v5. Please specify the weights and subsets you need.");
    }
    const promises = [];
    const styles = style ? [
        style
    ] : Object.keys(meta.fonts);
    let fontsLoaded = 0;
    for (const style2 of styles){
        if (typeof FontFace === "undefined") {
            continue;
        }
        if (!meta.fonts[style2]) {
            throw new Error(`The font ${meta.fontFamily} does not have a style ${style2}`);
        }
        const weights = options?.weights ?? Object.keys(meta.fonts[style2]);
        for (const weight of weights){
            if (!meta.fonts[style2][weight]) {
                throw new Error(`The font ${meta.fontFamily} does not  have a weight ${weight} in style ${style2}`);
            }
            const subsets = options?.subsets ?? Object.keys(meta.fonts[style2][weight]);
            for (const subset of subsets){
                let font = meta.fonts[style2]?.[weight]?.[subset];
                if (!font) {
                    throw new Error(`weight: ${weight} subset: ${subset} is not available for '${meta.fontFamily}'`);
                }
                let fontKey = `${meta.fontFamily}-${style2}-${weight}-${subset}`;
                const previousPromise = loadedFonts[fontKey];
                if (previousPromise) {
                    promises.push(previousPromise);
                    continue;
                }
                const baseLabel = `Fetching ${meta.fontFamily} font ${JSON.stringify({
                    style: style2,
                    weight,
                    subset
                })}`;
                const label = weightsAndSubsetsAreSpecified ? baseLabel : `${baseLabel}. This might be caused by loading too many font variations. Read more: https://www.remotion.dev/docs/troubleshooting/font-loading-errors#render-timeout-when-loading-google-fonts`;
                const handle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["delayRender"])(label, {
                    timeoutInMilliseconds: 60000
                });
                fontsLoaded++;
                const fontFace = new FontFace(meta.fontFamily, `url(${font}) format('woff2')`, {
                    weight,
                    style: style2,
                    unicodeRange: meta.unicodeRanges[subset]
                });
                let attempts = 2;
                const tryToLoad = ()=>{
                    if (fontFace.status === "loaded") {
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["continueRender"])(handle);
                        return;
                    }
                    const promise = loadFontFaceOrTimeoutAfter20Seconds(fontFace).then(()=>{
                        (options?.document ?? document).fonts.add(fontFace);
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["continueRender"])(handle);
                    }).catch((err)=>{
                        loadedFonts[fontKey] = undefined;
                        if (attempts === 0) {
                            throw err;
                        } else {
                            attempts--;
                            tryToLoad();
                        }
                    });
                    loadedFonts[fontKey] = promise;
                    promises.push(promise);
                };
                tryToLoad();
            }
        }
        if (fontsLoaded > 20) {
            console.warn(`Made ${fontsLoaded} network requests to load fonts for ${meta.fontFamily}. Consider loading fewer weights and subsets by passing options to loadFont(). Disable this warning by passing "ignoreTooManyRequestsWarning: true" to "options".`);
        }
    }
    return {
        fontFamily: meta.fontFamily,
        fonts: meta.fonts,
        unicodeRanges: meta.unicodeRanges,
        waitUntilDone: ()=>Promise.all(promises).then(()=>{
                return;
            })
    };
};
// src/Inter.ts
var getInfo = ()=>({
        fontFamily: "Inter",
        importName: "Inter",
        version: "v20",
        url: "https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900",
        unicodeRanges: {
            "cyrillic-ext": "U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F",
            cyrillic: "U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116",
            "greek-ext": "U+1F00-1FFF",
            greek: "U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF",
            vietnamese: "U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB",
            "latin-ext": "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF",
            latin: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"
        },
        fonts: {
            italic: {
                "100": {
                    "cyrillic-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L0UUMJng.woff2",
                    cyrillic: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L9UUMJng.woff2",
                    "greek-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L1UUMJng.woff2",
                    greek: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L6UUMJng.woff2",
                    vietnamese: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L2UUMJng.woff2",
                    "latin-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L3UUMJng.woff2",
                    latin: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L5UUM.woff2"
                },
                "200": {
                    "cyrillic-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L0UUMJng.woff2",
                    cyrillic: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L9UUMJng.woff2",
                    "greek-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L1UUMJng.woff2",
                    greek: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L6UUMJng.woff2",
                    vietnamese: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L2UUMJng.woff2",
                    "latin-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L3UUMJng.woff2",
                    latin: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L5UUM.woff2"
                },
                "300": {
                    "cyrillic-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L0UUMJng.woff2",
                    cyrillic: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L9UUMJng.woff2",
                    "greek-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L1UUMJng.woff2",
                    greek: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L6UUMJng.woff2",
                    vietnamese: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L2UUMJng.woff2",
                    "latin-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L3UUMJng.woff2",
                    latin: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L5UUM.woff2"
                },
                "400": {
                    "cyrillic-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L0UUMJng.woff2",
                    cyrillic: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L9UUMJng.woff2",
                    "greek-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L1UUMJng.woff2",
                    greek: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L6UUMJng.woff2",
                    vietnamese: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L2UUMJng.woff2",
                    "latin-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L3UUMJng.woff2",
                    latin: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L5UUM.woff2"
                },
                "500": {
                    "cyrillic-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L0UUMJng.woff2",
                    cyrillic: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L9UUMJng.woff2",
                    "greek-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L1UUMJng.woff2",
                    greek: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L6UUMJng.woff2",
                    vietnamese: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L2UUMJng.woff2",
                    "latin-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L3UUMJng.woff2",
                    latin: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L5UUM.woff2"
                },
                "600": {
                    "cyrillic-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L0UUMJng.woff2",
                    cyrillic: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L9UUMJng.woff2",
                    "greek-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L1UUMJng.woff2",
                    greek: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L6UUMJng.woff2",
                    vietnamese: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L2UUMJng.woff2",
                    "latin-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L3UUMJng.woff2",
                    latin: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L5UUM.woff2"
                },
                "700": {
                    "cyrillic-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L0UUMJng.woff2",
                    cyrillic: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L9UUMJng.woff2",
                    "greek-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L1UUMJng.woff2",
                    greek: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L6UUMJng.woff2",
                    vietnamese: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L2UUMJng.woff2",
                    "latin-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L3UUMJng.woff2",
                    latin: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L5UUM.woff2"
                },
                "800": {
                    "cyrillic-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L0UUMJng.woff2",
                    cyrillic: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L9UUMJng.woff2",
                    "greek-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L1UUMJng.woff2",
                    greek: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L6UUMJng.woff2",
                    vietnamese: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L2UUMJng.woff2",
                    "latin-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L3UUMJng.woff2",
                    latin: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L5UUM.woff2"
                },
                "900": {
                    "cyrillic-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L0UUMJng.woff2",
                    cyrillic: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L9UUMJng.woff2",
                    "greek-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L1UUMJng.woff2",
                    greek: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L6UUMJng.woff2",
                    vietnamese: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L2UUMJng.woff2",
                    "latin-ext": "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L3UUMJng.woff2",
                    latin: "https://fonts.gstatic.com/s/inter/v20/UcC53FwrK3iLTcvneQg7Ca725JhhKnNqk6L5UUM.woff2"
                }
            },
            normal: {
                "100": {
                    "cyrillic-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2JL7SUc.woff2",
                    cyrillic: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa0ZL7SUc.woff2",
                    "greek-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2ZL7SUc.woff2",
                    greek: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1pL7SUc.woff2",
                    vietnamese: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2pL7SUc.woff2",
                    "latin-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa25L7SUc.woff2",
                    latin: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2"
                },
                "200": {
                    "cyrillic-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2JL7SUc.woff2",
                    cyrillic: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa0ZL7SUc.woff2",
                    "greek-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2ZL7SUc.woff2",
                    greek: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1pL7SUc.woff2",
                    vietnamese: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2pL7SUc.woff2",
                    "latin-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa25L7SUc.woff2",
                    latin: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2"
                },
                "300": {
                    "cyrillic-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2JL7SUc.woff2",
                    cyrillic: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa0ZL7SUc.woff2",
                    "greek-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2ZL7SUc.woff2",
                    greek: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1pL7SUc.woff2",
                    vietnamese: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2pL7SUc.woff2",
                    "latin-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa25L7SUc.woff2",
                    latin: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2"
                },
                "400": {
                    "cyrillic-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2JL7SUc.woff2",
                    cyrillic: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa0ZL7SUc.woff2",
                    "greek-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2ZL7SUc.woff2",
                    greek: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1pL7SUc.woff2",
                    vietnamese: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2pL7SUc.woff2",
                    "latin-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa25L7SUc.woff2",
                    latin: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2"
                },
                "500": {
                    "cyrillic-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2JL7SUc.woff2",
                    cyrillic: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa0ZL7SUc.woff2",
                    "greek-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2ZL7SUc.woff2",
                    greek: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1pL7SUc.woff2",
                    vietnamese: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2pL7SUc.woff2",
                    "latin-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa25L7SUc.woff2",
                    latin: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2"
                },
                "600": {
                    "cyrillic-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2JL7SUc.woff2",
                    cyrillic: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa0ZL7SUc.woff2",
                    "greek-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2ZL7SUc.woff2",
                    greek: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1pL7SUc.woff2",
                    vietnamese: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2pL7SUc.woff2",
                    "latin-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa25L7SUc.woff2",
                    latin: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2"
                },
                "700": {
                    "cyrillic-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2JL7SUc.woff2",
                    cyrillic: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa0ZL7SUc.woff2",
                    "greek-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2ZL7SUc.woff2",
                    greek: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1pL7SUc.woff2",
                    vietnamese: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2pL7SUc.woff2",
                    "latin-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa25L7SUc.woff2",
                    latin: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2"
                },
                "800": {
                    "cyrillic-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2JL7SUc.woff2",
                    cyrillic: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa0ZL7SUc.woff2",
                    "greek-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2ZL7SUc.woff2",
                    greek: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1pL7SUc.woff2",
                    vietnamese: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2pL7SUc.woff2",
                    "latin-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa25L7SUc.woff2",
                    latin: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2"
                },
                "900": {
                    "cyrillic-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2JL7SUc.woff2",
                    cyrillic: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa0ZL7SUc.woff2",
                    "greek-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2ZL7SUc.woff2",
                    greek: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1pL7SUc.woff2",
                    vietnamese: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2pL7SUc.woff2",
                    "latin-ext": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa25L7SUc.woff2",
                    latin: "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2"
                }
            }
        },
        subsets: [
            "cyrillic",
            "cyrillic-ext",
            "greek",
            "greek-ext",
            "latin",
            "latin-ext",
            "vietnamese"
        ]
    });
var fontFamily = "Inter";
var loadFont = (style, options)=>{
    return loadFonts(getInfo(), style, options);
};
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/packages/shapes/dist/esm/index.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/utils/make-circle.ts
__turbopack_context__.s([
    "Circle",
    ()=>Circle,
    "Ellipse",
    ()=>Ellipse,
    "Heart",
    ()=>Heart,
    "Pie",
    ()=>Pie,
    "Polygon",
    ()=>Polygon,
    "Rect",
    ()=>Rect,
    "Star",
    ()=>Star,
    "Triangle",
    ()=>Triangle,
    "makeCircle",
    ()=>makeCircle,
    "makeEllipse",
    ()=>makeEllipse,
    "makeHeart",
    ()=>makeHeart,
    "makePie",
    ()=>makePie,
    "makePolygon",
    ()=>makePolygon,
    "makeRect",
    ()=>makeRect,
    "makeStar",
    ()=>makeStar,
    "makeTriangle",
    ()=>makeTriangle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$paths$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/paths/dist/esm/index.mjs [app-client] (ecmascript)");
// src/components/render-svg.tsx
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
// src/components/render-svg.tsx
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.bun/next@16.0.0+1eeaf37cadfdd01a/node_modules/next/dist/compiled/react/jsx-runtime.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
var makeCircle = ({ radius })=>{
    const instructions = [
        {
            type: "M",
            x: radius,
            y: 0
        },
        {
            type: "a",
            rx: radius,
            ry: radius,
            xAxisRotation: 0,
            largeArcFlag: true,
            sweepFlag: true,
            dx: 0,
            dy: radius * 2
        },
        {
            type: "a",
            rx: radius,
            ry: radius,
            xAxisRotation: 0,
            largeArcFlag: true,
            sweepFlag: true,
            dx: 0,
            dy: -radius * 2
        },
        {
            type: "Z"
        }
    ];
    const path = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$paths$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serializeInstructions"])(instructions);
    return {
        height: radius * 2,
        width: radius * 2,
        path,
        instructions,
        transformOrigin: `${radius} ${radius}`
    };
};
;
;
// src/utils/does-react-support-canary.ts
var doesReactSupportTransformOriginProperty = (version)=>{
    if (version.includes("canary") || version.includes("experimental")) {
        const last8Chars = parseInt(version.slice(-8), 10);
        return last8Chars > 20230209;
    }
    const [major] = version.split(".").map(Number);
    return major > 18;
};
;
var RenderSvg = ({ width, height, path, style, pathStyle, transformOrigin, debug, instructions, ...props })=>{
    _s();
    const actualStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "RenderSvg.useMemo[actualStyle]": ()=>{
            return {
                overflow: "visible",
                ...style ?? {}
            };
        }
    }["RenderSvg.useMemo[actualStyle]"], [
        style
    ]);
    const actualPathStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "RenderSvg.useMemo[actualPathStyle]": ()=>{
            return {
                transformBox: "fill-box",
                ...pathStyle ?? {}
            };
        }
    }["RenderSvg.useMemo[actualPathStyle]"], [
        pathStyle
    ]);
    const reactSupportsTransformOrigin = doesReactSupportTransformOriginProperty(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["version"]);
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxs"])("svg", {
        width,
        height,
        viewBox: `0 0 ${width} ${height}`,
        xmlns: "http://www.w3.org/2000/svg",
        style: actualStyle,
        children: [
            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("path", {
                ...reactSupportsTransformOrigin ? {
                    transformOrigin
                } : {
                    "transform-origin": transformOrigin
                },
                d: path,
                style: actualPathStyle,
                ...props
            }),
            debug ? instructions.map((i, index)=>{
                if (i.type === "C") {
                    const prevInstruction = index === 0 ? instructions[instructions.length - 1] : instructions[index - 1];
                    if (prevInstruction.type === "V" || prevInstruction.type === "H" || prevInstruction.type === "a" || prevInstruction.type === "Z" || prevInstruction.type === "t" || prevInstruction.type === "q" || prevInstruction.type === "l" || prevInstruction.type === "c" || prevInstruction.type === "m" || prevInstruction.type === "h" || prevInstruction.type === "s" || prevInstruction.type === "v") {
                        return null;
                    }
                    const prevX = prevInstruction.x;
                    const prevY = prevInstruction.y;
                    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxs"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Fragment, {
                        children: [
                            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("path", {
                                d: `M ${prevX} ${prevY} ${i.cp1x} ${i.cp1y}`,
                                strokeWidth: 2,
                                stroke: "rgba(0, 0, 0, 0.4)"
                            }),
                            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("path", {
                                d: `M ${i.x} ${i.y} ${i.cp2x} ${i.cp2y}`,
                                strokeWidth: 2,
                                stroke: "rgba(0, 0, 0, 0.4)"
                            }),
                            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("circle", {
                                cx: i.cp1x,
                                cy: i.cp1y,
                                r: 3,
                                fill: "white",
                                strokeWidth: 2,
                                stroke: "black"
                            }),
                            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])("circle", {
                                cx: i.cp2x,
                                cy: i.cp2y,
                                r: 3,
                                strokeWidth: 2,
                                fill: "white",
                                stroke: "black"
                            })
                        ]
                    }, index);
                }
                return null;
            }) : null
        ]
    });
};
_s(RenderSvg, "i/7e4Xg+5pr8CEG9wzXyvxcmVLs=");
_c = RenderSvg;
;
var Circle = ({ radius, ...props })=>{
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(RenderSvg, {
        ...makeCircle({
            radius
        }),
        ...props
    });
};
_c1 = Circle;
;
var makeEllipse = ({ rx, ry })=>{
    const instructions = [
        {
            type: "M",
            x: rx,
            y: 0
        },
        {
            type: "a",
            rx,
            ry,
            xAxisRotation: 0,
            largeArcFlag: true,
            sweepFlag: false,
            dx: 1,
            dy: 0
        },
        {
            type: "Z"
        }
    ];
    const path = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$paths$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serializeInstructions"])(instructions);
    return {
        width: rx * 2,
        height: ry * 2,
        path,
        instructions,
        transformOrigin: `${rx} ${ry}`
    };
};
;
var Ellipse = ({ rx, ry, ...props })=>{
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(RenderSvg, {
        ...makeEllipse({
            rx,
            ry
        }),
        ...props
    });
};
_c2 = Ellipse;
;
var makeHeart = ({ height, aspectRatio = 1.1, bottomRoundnessAdjustment = 0, depthAdjustment = 0 })=>{
    const width = height * aspectRatio;
    const bottomControlPointX = 23 / 110 * width + bottomRoundnessAdjustment * width;
    const bottomControlPointY = 69 / 100 * height;
    const bottomLeftControlPointY = 60 / 100 * height;
    const topLeftControlPoint = 13 / 100 * height;
    const topBezierWidth = 29 / 110 * width;
    const topRightControlPointX = 15 / 110 * width;
    const innerControlPointX = 5 / 110 * width;
    const innerControlPointY = 7 / 100 * height;
    const depth = 17 / 100 * height + depthAdjustment * height;
    const instructions = [
        {
            type: "M",
            x: width / 2,
            y: height
        },
        {
            type: "C",
            cp1x: width / 2 - bottomControlPointX,
            cp1y: bottomControlPointY,
            cp2x: 0,
            cp2y: bottomLeftControlPointY,
            x: 0,
            y: height / 4
        },
        {
            type: "C",
            cp1x: 0,
            cp1y: topLeftControlPoint,
            cp2x: width / 4 - topBezierWidth / 2,
            cp2y: 0,
            x: width / 4,
            y: 0
        },
        {
            type: "C",
            cp1x: width / 4 + topBezierWidth / 2,
            cp1y: 0,
            cp2x: width / 2 - innerControlPointX,
            cp2y: innerControlPointY,
            x: width / 2,
            y: depth
        },
        {
            type: "C",
            cp1x: width / 2 + innerControlPointX,
            cp1y: innerControlPointY,
            cp2x: width / 2 + topRightControlPointX,
            cp2y: 0,
            x: width / 4 * 3,
            y: 0
        },
        {
            type: "C",
            cp1x: width / 4 * 3 + topBezierWidth / 2,
            cp1y: 0,
            cp2x: width,
            cp2y: topLeftControlPoint,
            x: width,
            y: height / 4
        },
        {
            type: "C",
            x: width / 2,
            y: height,
            cp1x: width,
            cp1y: bottomLeftControlPointY,
            cp2x: width / 2 + bottomControlPointX,
            cp2y: bottomControlPointY
        },
        {
            type: "Z"
        }
    ];
    const path = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$paths$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serializeInstructions"])(instructions);
    return {
        path,
        width,
        height,
        transformOrigin: `${width / 2} ${height / 2}`,
        instructions
    };
};
;
var Heart = ({ aspectRatio, height, bottomRoundnessAdjustment = 0, depthAdjustment = 0, ...props })=>{
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(RenderSvg, {
        ...makeHeart({
            aspectRatio,
            height,
            bottomRoundnessAdjustment,
            depthAdjustment
        }),
        ...props
    });
};
_c3 = Heart;
;
var getCoord = ({ counterClockwise, actualProgress, rotation, radius, coord })=>{
    const factor = counterClockwise ? -1 : 1;
    const val = Math[coord === "x" ? "cos" : "sin"](factor * actualProgress * Math.PI * 2 + Math.PI * 1.5 + rotation) * radius + radius;
    const rounded = Math.round(val * 1e5) / 1e5;
    return rounded;
};
var makePie = ({ progress, radius, closePath = true, counterClockwise = false, rotation = 0 })=>{
    const actualProgress = Math.min(Math.max(progress, 0), 1);
    const endAngleX = getCoord({
        actualProgress,
        coord: "x",
        counterClockwise,
        radius,
        rotation
    });
    const endAngleY = getCoord({
        actualProgress,
        coord: "y",
        counterClockwise,
        radius,
        rotation
    });
    const start = {
        x: getCoord({
            actualProgress: 0,
            coord: "x",
            counterClockwise,
            radius,
            rotation
        }),
        y: getCoord({
            actualProgress: 0,
            coord: "y",
            counterClockwise,
            radius,
            rotation
        })
    };
    const end = {
        x: endAngleX,
        y: endAngleY
    };
    const instructions = [
        {
            type: "M",
            ...start
        },
        {
            type: "A",
            rx: radius,
            ry: radius,
            xAxisRotation: 0,
            largeArcFlag: false,
            sweepFlag: !counterClockwise,
            x: actualProgress <= 0.5 ? endAngleX : getCoord({
                actualProgress: 0.5,
                coord: "x",
                counterClockwise,
                radius,
                rotation
            }),
            y: actualProgress <= 0.5 ? endAngleY : getCoord({
                actualProgress: 0.5,
                coord: "y",
                counterClockwise,
                radius,
                rotation
            })
        },
        actualProgress > 0.5 ? {
            type: "A",
            rx: radius,
            ry: radius,
            xAxisRotation: 0,
            largeArcFlag: false,
            sweepFlag: !counterClockwise,
            ...end
        } : null,
        actualProgress > 0 && actualProgress < 1 && closePath ? {
            type: "L",
            x: radius,
            y: radius
        } : null,
        closePath ? {
            type: "Z"
        } : null
    ].filter(Boolean);
    const path = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$paths$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serializeInstructions"])(instructions);
    return {
        height: radius * 2,
        width: radius * 2,
        path,
        instructions,
        transformOrigin: `${radius} ${radius}`
    };
};
;
var Pie = ({ radius, progress, closePath, counterClockwise, rotation, ...props })=>{
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(RenderSvg, {
        ...makePie({
            radius,
            progress,
            closePath,
            counterClockwise,
            rotation
        }),
        ...props
    });
};
_c4 = Pie;
;
// src/utils/join-points.ts
var shortenVector = (vector, radius)=>{
    const [x, y] = vector;
    const currentLength = Math.sqrt(x * x + y * y);
    const scalingFactor = (currentLength - radius) / currentLength;
    return [
        x * scalingFactor,
        y * scalingFactor
    ];
};
var scaleVectorToLength = (vector, length)=>{
    const [x, y] = vector;
    const currentLength = Math.sqrt(x * x + y * y);
    const scalingFactor = length / currentLength;
    return [
        x * scalingFactor,
        y * scalingFactor
    ];
};
var joinPoints = (points, { edgeRoundness, cornerRadius, roundCornerStrategy })=>{
    return points.map(([x, y], i)=>{
        const prevPointIndex = i === 0 ? points.length - 2 : i - 1;
        const prevPoint = points[prevPointIndex];
        const nextPointIndex = i === points.length - 1 ? 1 : i + 1;
        const nextPoint = points[nextPointIndex];
        const middleOfLine = [
            (x + nextPoint[0]) / 2,
            (y + nextPoint[1]) / 2
        ];
        const prevPointMiddleOfLine = [
            (x + prevPoint[0]) / 2,
            (y + prevPoint[1]) / 2
        ];
        const prevVector = [
            x - prevPoint[0],
            y - prevPoint[1]
        ];
        const nextVector = [
            nextPoint[0] - x,
            nextPoint[1] - y
        ];
        if (i === 0) {
            if (edgeRoundness !== null) {
                return [
                    {
                        type: "M",
                        x: middleOfLine[0],
                        y: middleOfLine[1]
                    }
                ];
            }
            if (cornerRadius !== 0) {
                const computeRadius = shortenVector(nextVector, cornerRadius);
                return [
                    {
                        type: "M",
                        x: computeRadius[0] + x,
                        y: computeRadius[1] + y
                    }
                ];
            }
            return [
                {
                    type: "M",
                    x,
                    y
                }
            ];
        }
        if (cornerRadius && edgeRoundness !== null) {
            throw new Error(`"cornerRadius" and "edgeRoundness" cannot be specified at the same time.`);
        }
        if (edgeRoundness === null) {
            if (cornerRadius === 0) {
                return [
                    {
                        type: "L",
                        x,
                        y
                    }
                ];
            }
            const prevVectorMinusRadius = shortenVector(prevVector, cornerRadius);
            const prevVectorLength = scaleVectorToLength(prevVector, cornerRadius);
            const nextVectorMinusRadius = scaleVectorToLength(nextVector, cornerRadius);
            const firstDraw = [
                prevPoint[0] + prevVectorMinusRadius[0],
                prevPoint[1] + prevVectorMinusRadius[1]
            ];
            return [
                {
                    type: "L",
                    x: firstDraw[0],
                    y: firstDraw[1]
                },
                roundCornerStrategy === "arc" ? {
                    type: "a",
                    rx: cornerRadius,
                    ry: cornerRadius,
                    xAxisRotation: 0,
                    dx: prevVectorLength[0] + nextVectorMinusRadius[0],
                    dy: prevVectorLength[1] + nextVectorMinusRadius[1],
                    largeArcFlag: false,
                    sweepFlag: true
                } : {
                    type: "C",
                    x: firstDraw[0] + prevVectorLength[0] + nextVectorMinusRadius[0],
                    y: firstDraw[1] + prevVectorLength[1] + nextVectorMinusRadius[1],
                    cp1x: x,
                    cp1y: y,
                    cp2x: x,
                    cp2y: y
                }
            ];
        }
        const controlPoint1 = [
            prevPointMiddleOfLine[0] + prevVector[0] * edgeRoundness * 0.5,
            prevPointMiddleOfLine[1] + prevVector[1] * edgeRoundness * 0.5
        ];
        const controlPoint2 = [
            middleOfLine[0] - nextVector[0] * edgeRoundness * 0.5,
            middleOfLine[1] - nextVector[1] * edgeRoundness * 0.5
        ];
        return [
            {
                type: "C",
                cp1x: controlPoint1[0],
                cp1y: controlPoint1[1],
                cp2x: controlPoint2[0],
                cp2y: controlPoint2[1],
                x: middleOfLine[0],
                y: middleOfLine[1]
            }
        ];
    }).flat(1);
};
// src/utils/make-polygon.ts
function polygon({ points, radius, centerX, centerY, cornerRadius, edgeRoundness }) {
    const degreeIncrement = Math.PI * 2 / points;
    const d = new Array(points).fill(0).map((_, i)=>{
        const angle = degreeIncrement * i - Math.PI / 2;
        const point = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        };
        return [
            point.x,
            point.y
        ];
    });
    return joinPoints([
        ...d,
        d[0]
    ], {
        edgeRoundness,
        cornerRadius,
        roundCornerStrategy: cornerRadius > 0 ? "bezier" : "arc"
    });
}
var makePolygon = ({ points, radius, cornerRadius = 0, edgeRoundness = null })=>{
    if (points < 3) {
        throw new Error(`"points" should be minimum 3, got ${points}`);
    }
    const width = 2 * radius;
    const height = 2 * radius;
    const centerX = width / 2;
    const centerY = height / 2;
    const polygonPathInstructions = polygon({
        points,
        radius,
        centerX,
        centerY,
        cornerRadius,
        edgeRoundness
    });
    const reduced = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$paths$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["reduceInstructions"])(polygonPathInstructions);
    const path = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$paths$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resetPath"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$paths$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serializeInstructions"])(reduced));
    const boundingBox = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$paths$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PathInternals"].getBoundingBoxFromInstructions(reduced);
    return {
        path,
        width: boundingBox.width,
        height: boundingBox.height,
        transformOrigin: `${centerX} ${centerY}`,
        instructions: polygonPathInstructions
    };
};
;
var Polygon = ({ points, radius, cornerRadius, edgeRoundness, ...props })=>{
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(RenderSvg, {
        ...makePolygon({
            points,
            cornerRadius,
            edgeRoundness,
            radius
        }),
        ...props
    });
};
_c5 = Polygon;
;
var makeRect = ({ width, height, edgeRoundness = null, cornerRadius = 0 })=>{
    const transformOrigin = [
        width / 2,
        height / 2
    ];
    const instructions = [
        ...joinPoints([
            [
                cornerRadius,
                0
            ],
            [
                width,
                0
            ],
            [
                width,
                height
            ],
            [
                0,
                height
            ],
            [
                0,
                0
            ]
        ], {
            edgeRoundness,
            cornerRadius,
            roundCornerStrategy: "arc"
        }),
        {
            type: "Z"
        }
    ];
    const path = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$paths$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serializeInstructions"])(instructions);
    return {
        width,
        height,
        instructions,
        path,
        transformOrigin: transformOrigin.join(" ")
    };
};
;
var Rect = ({ width, edgeRoundness, height, cornerRadius, ...props })=>{
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(RenderSvg, {
        ...makeRect({
            height,
            width,
            edgeRoundness,
            cornerRadius
        }),
        ...props
    });
};
_c6 = Rect;
;
var star = ({ centerX, centerY, points, innerRadius, outerRadius, cornerRadius, edgeRoundness })=>{
    const degreeIncrement = Math.PI * 2 / (points * 2);
    const d = new Array(points * 2).fill(true).map((_p, i)=>{
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = degreeIncrement * i - Math.PI / 2;
        const point = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        };
        return [
            point.x,
            point.y
        ];
    });
    return [
        ...joinPoints([
            ...d,
            d[0]
        ], {
            edgeRoundness,
            cornerRadius,
            roundCornerStrategy: cornerRadius > 0 ? "bezier" : "arc"
        }),
        {
            type: "Z"
        }
    ];
};
var makeStar = ({ points, innerRadius, outerRadius, cornerRadius = 0, edgeRoundness = null })=>{
    const width = outerRadius * 2;
    const height = outerRadius * 2;
    const centerX = width / 2;
    const centerY = height / 2;
    const starPathInstructions = star({
        centerX,
        centerY,
        points,
        innerRadius,
        outerRadius,
        cornerRadius,
        edgeRoundness
    });
    const reduced = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$paths$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["reduceInstructions"])(starPathInstructions);
    const path = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$paths$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resetPath"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$paths$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serializeInstructions"])(reduced));
    const boundingBox = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$paths$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PathInternals"].getBoundingBoxFromInstructions(reduced);
    return {
        path,
        width: boundingBox.width,
        height: boundingBox.height,
        transformOrigin: `${centerX} ${centerY}`,
        instructions: starPathInstructions
    };
};
;
var Star = ({ innerRadius, outerRadius, points, cornerRadius, edgeRoundness, ...props })=>{
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(RenderSvg, {
        ...makeStar({
            innerRadius,
            outerRadius,
            points,
            cornerRadius,
            edgeRoundness
        }),
        ...props
    });
};
_c7 = Star;
;
var makeTriangle = ({ length, direction = "right", edgeRoundness = null, cornerRadius = 0 })=>{
    if (typeof length !== "number") {
        throw new Error(`"length" of a triangle must be a number, got ${JSON.stringify(length)}`);
    }
    const longerDimension = length;
    const shorterSize = Math.sqrt(length ** 2 * 0.75);
    const points = {
        up: [
            [
                longerDimension / 2,
                0
            ],
            [
                0,
                shorterSize
            ],
            [
                longerDimension,
                shorterSize
            ],
            [
                longerDimension / 2,
                0
            ]
        ],
        right: [
            [
                0,
                0
            ],
            [
                0,
                longerDimension
            ],
            [
                shorterSize,
                longerDimension / 2
            ],
            [
                0,
                0
            ]
        ],
        down: [
            [
                0,
                0
            ],
            [
                longerDimension,
                0
            ],
            [
                longerDimension / 2,
                shorterSize
            ],
            [
                0,
                0
            ]
        ],
        left: [
            [
                shorterSize,
                0
            ],
            [
                shorterSize,
                longerDimension
            ],
            [
                0,
                longerDimension / 2
            ],
            [
                shorterSize,
                0
            ]
        ]
    };
    const transformOriginX = {
        left: shorterSize / 3 * 2,
        right: shorterSize / 3,
        up: longerDimension / 2,
        down: longerDimension / 2
    }[direction];
    const transformOriginY = {
        up: shorterSize / 3 * 2,
        down: shorterSize / 3,
        left: longerDimension / 2,
        right: longerDimension / 2
    }[direction];
    const instructions = [
        ...joinPoints(points[direction], {
            edgeRoundness,
            cornerRadius,
            roundCornerStrategy: "bezier"
        }),
        {
            type: "Z"
        }
    ];
    const path = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$paths$2f$dist$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serializeInstructions"])(instructions);
    return {
        path,
        instructions,
        width: direction === "up" || direction === "down" ? length : shorterSize,
        height: direction === "up" || direction === "down" ? shorterSize : length,
        transformOrigin: `${transformOriginX} ${transformOriginY}`
    };
};
;
var Triangle = ({ length, direction, edgeRoundness, cornerRadius, ...props })=>{
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$bun$2f$next$40$16$2e$0$2e$0$2b$1eeaf37cadfdd01a$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsx"])(RenderSvg, {
        ...makeTriangle({
            length,
            direction,
            edgeRoundness,
            cornerRadius
        }),
        ...props
    });
};
_c8 = Triangle;
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8;
__turbopack_context__.k.register(_c, "RenderSvg");
__turbopack_context__.k.register(_c1, "Circle");
__turbopack_context__.k.register(_c2, "Ellipse");
__turbopack_context__.k.register(_c3, "Heart");
__turbopack_context__.k.register(_c4, "Pie");
__turbopack_context__.k.register(_c5, "Polygon");
__turbopack_context__.k.register(_c6, "Rect");
__turbopack_context__.k.register(_c7, "Star");
__turbopack_context__.k.register(_c8, "Triangle");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=packages_0fae0103._.js.map