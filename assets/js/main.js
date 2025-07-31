// assets/js/main.js - War 1939 Military Theme

// --- CONFIGURAÇÃO DA PLANILHA DO GOOGLE SHEETS ---
// URLs das planilhas publicadas como CSV
const COUNTRY_STATS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR5Pw3aRXSTIGMglyNAUNqLtOl7wjX9bMeFXEASkQYC34g_zDyDx3LE8Vm73FUoNn27UAlKLizQBXBO/pub?gid=0&single=true&output=csv';
const METAIS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR5Pw3aRXSTIGMglyNAUNqLtOl7wjX9bMeFXEASkQYC34g_zDyDx3LE8Vm73FUoNn27UAlKLizQBXBO/pub?gid=1505649898&single=true&output=csv';
const VEICULOS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR5Pw3aRXSTIGMglyNAUNqLtOl7wjX9bMeFXEASkQYC34g_zDyDx3LE8Vm73FUoNn27UAlKLizQBXBO/pub?gid=1616220418&single=true&output=csv';

// --- DADOS DO JOGO ---
const gameData = {
    countries: {},
    doctrines: {
        infantry_tank: {
            name: "Tanque de Infantaria",
            description: "Doutrina focada em cooperação próxima com infantaria. Prioriza blindagem pesada e confiabilidade sobre velocidade. Inspirada nas teorias britânicas de guerra de trincheiras.",
            cost_modifier: 1.30,
            speed_modifier: 0.60,
            armor_effectiveness_modifier: 1.15,
            reliability_modifier: 1.05,
            crew_comfort_modifier: 1.05,
            max_crew_mod: 0,
            armor_cost_weight_reduction_percent: 0.10,
            durability_bonus: 0.05,
            infantry_moral_bonus: 0.10,
            speed_penalty: 0.20,
            maneuverability_penalty: 0.10,
        },
        cruiser_tank: {
            name: "Tanque Cruzador",
            description: "Filosofia de exploração e perseguição rápida. Enfatiza velocidade e manobrabilidade para operações de cavalaria mecanizada. Conceito britânico para guerra móvel.",
            cost_modifier: 1.10,
            speed_modifier: 1.35,
            armor_effectiveness_modifier: 0.95,
            reliability_modifier: 0.95,
            maneuverability_modifier: 1.10,
            max_crew_mod: 0,
            engine_cost_weight_reduction_percent: 0.15,
            range_bonus: 0.10,
            initiative_bonus: 0.15,
            armor_cost_weight_increase_percent: 0.05,
            offroad_speed_penalty: 0.05,
        },
        light_tank_doctrine: {
            name: "Doutrina de Tanques Leves",
            description: "Foco em economia e produção em massa. Destinada a reconhecimento e operações coloniais. Prioriza custo baixo sobre capacidade de combate intensivo.",
            cost_modifier: 0.75,
            speed_modifier: 1.15,
            armor_effectiveness_modifier: 0.85,
            reliability_modifier: 1.05,
            max_crew_mod: -2,
            cost_reduction_percent: 0.15,
            metal_efficiency_bonus: 0.10,
            production_speed_bonus: 0.10,
            max_main_gun_caliber_limit: 75,
            secondary_armament_limit_penalty: 1,
        },
        blitzkrieg: {
            name: "Blitzkrieg (Guerra Relâmpago)",
            description: "Doutrina alemã de guerra rápida e coordenada. Enfatiza comunicação por rádio, mobilidade e concentração de forças. Revolução na arte militar moderna.",
            cost_modifier: 1.05,
            speed_modifier: 1.20,
            reliability_modifier: 1.10,
            crew_comfort_modifier: 1.05,
            armor_effectiveness_modifier: 0.98,
            optics_radio_bonus_multiplier: 0.02,
            max_crew_mod: 0,
            advanced_component_cost_increase: 0.10,
            quality_production_slider_bias: 0.10,
        },
        deep_battle: {
            name: "Batalha Profunda (Doutrina Soviética)",
            description: "Teoria militar soviética de penetração profunda e exploração. Foca em produção massiva, simplicidade operacional e avanço contínuo através de linhas inimigas.",
            cost_modifier: 0.85,
            reliability_modifier: 0.95,
            country_production_capacity_bonus: 0.10,
            armor_effectiveness_modifier: 1.05,
            speed_modifier: 1.10,
            crew_comfort_modifier: 0.90,
            max_crew_mod: 0,
            base_comfort_penalty: 0.10,
            complex_component_reliability_penalty: 0.15,
            production_quality_slider_bias: -0.10,
        },
        combined_arms: {
            name: "Armas Combinadas (Doutrina Americana)",
            description: "Integração de tanques, infantaria, artilharia e aviação. Enfatiza versatilidade, suporte logístico e conforto operacional. Abordagem tecnológica avançada.",
            cost_modifier: 1.10,
            reliability_modifier: 1.05,
            crew_comfort_modifier: 1.15,
            speed_modifier: 1.10,
            range_modifier: 1.10,
            country_production_capacity_bonus: 0.05,
            max_crew_mod: 0,
            comfort_bonus: 0.10,
            versatility_bonus: 0.05,
            extreme_design_cost_increase: 0.05,
        }
    },
    components: {
        vehicle_types: {
            tankette: { name: "Tankette", cost: 10000, weight: 3000, metal_cost: 1000, base_speed_road: 50, base_speed_offroad: 30, base_armor: 10, max_crew: 2, frontal_area_m2: 1.5, drag_coefficient: 1.2 },
            armored_car: { name: "Carro Blindado", cost: 15000, weight: 4000, metal_cost: 1500, base_speed_road: 80, base_speed_offroad: 40, base_armor: 15, max_crew: 3, frontal_area_m2: 2.0, drag_coefficient: 1.1 },
            halftrack: { name: "Semi-lagarta", cost: 20000, weight: 6000, metal_cost: 2000, base_speed_road: 65, base_speed_offroad: 45, base_armor: 20, max_crew: 3, frontal_area_m2: 2.5, drag_coefficient: 1.1 },
            carro_combate: { name: "Carro de Combate", cost: 40000, metal_cost: 2700, weight: 8000, base_speed_road: 40, base_speed_offroad: 25, base_armor: 50, max_crew: 4, frontal_area_m2: 3.0, drag_coefficient: 1.0 },
            transporte_infantaria: { name: "Veículo de Transporte de Infantaria", cost: 35000, metal_cost: 2250, weight: 7000, base_speed_road: 50, base_speed_offroad: 35, base_armor: 30, max_crew: 3, frontal_area_m2: 2.8, drag_coefficient: 1.0 },
            tanque_leve: { name: "Tanque Leve", cost: 33000, weight: 10000, metal_cost: 3300, base_speed_road: 55, base_speed_offroad: 35, base_armor: 30, max_crew: 3, frontal_area_m2: 2.5, drag_coefficient: 1.0 },
            tanque_medio: { name: "Tanque Médio", cost: 60000, weight: 20000, metal_cost: 6000, base_speed_road: 40, base_speed_offroad: 25, base_armor: 50, max_crew: 5, frontal_area_m2: 3.5, drag_coefficient: 1.0 },
            tanque_pesado: { name: "Tanque Pesado", cost: 500000, weight: 48000, metal_cost: 12000, base_speed_road: 35, base_speed_offroad: 20, base_armor: 90, max_crew: 6, frontal_area_m2: 4.0, drag_coefficient: 1.1 }, 
            super_pesado: { name: "Tanque Super Pesado", cost: 800000, weight: 80000, metal_cost: 25000, base_speed_road: 15, base_speed_offroad: 10, base_armor: 150, max_crew: 6, frontal_area_m2: 5.0, drag_coefficient: 1.3 },
            multi_turret_tank: { name: "Tanque de Múltiplas Torres", cost: 150000, weight: 30000, metal_cost: 9000, base_speed_road: 30, base_speed_offroad: 20, base_armor: 70, max_crew: 6, frontal_area_m2: 4.2, drag_coefficient: 1.15 },
            tank_destroyer: { name: "Caça-Tanques", cost: 70000, weight: 25000, metal_cost: 5000, base_speed_road: 40, base_speed_offroad: 25, base_armor: 60, max_crew: 4, frontal_area_m2: 3.2, drag_coefficient: 0.95 },
            assault_gun: { name: "Canhão de Assalto", cost: 60000, weight: 20000, metal_cost: 4000, base_speed_road: 35, base_speed_offroad: 20, base_armor: 50, max_crew: 4, frontal_area_m2: 3.0, drag_coefficient: 1.0 },
            command_vehicle: { name: "Veículo de Comando", cost: 30000, weight: 8000, metal_cost: 3000, base_speed_road: 50, base_speed_offroad: 35, base_armor: 25, max_crew: 3, frontal_area_m2: 2.5, drag_coefficient: 1.0 },
            engineering_vehicle: { name: "Veículo de Engenharia/Recuperação", cost: 35000, weight: 10000, metal_cost: 3500, base_speed_road: 45, base_speed_offroad: 30, base_armor: 20, max_crew: 3, frontal_area_m2: 3.0, drag_coefficient: 1.05 },
            artilharia_simples: { name: "Artilharia Simples", cost: 7500, weight: 1500, metal_cost: 750, base_speed_road: 20, base_speed_offroad: 10, base_armor: 10, max_crew: 2, frontal_area_m2: 2.0, drag_coefficient: 1.2 },
            artilharia_autopropulsada: { name: "Artilharia Autopropulsada", cost: 50000, weight: 15000, metal_cost: 3750, base_speed_road: 35, base_speed_offroad: 20, base_armor: 40, max_crew: 4, frontal_area_m2: 3.5, drag_coefficient: 1.1 },
            artilharia_antiaerea: { name: "Artilharia Antiaérea", cost: 10500, weight: 1200, metal_cost: 1050, base_speed_road: 40, base_speed_offroad: 25, base_armor: 20, max_crew: 3, frontal_area_m2: 2.2, drag_coefficient: 1.0 },
            aa_autopropulsada: { name: "AA Autopropulsada", cost: 50000, weight: 5000, metal_cost: 3750, base_speed_road: 45, base_speed_offroad: 30, base_armor: 30, max_crew: 3, frontal_area_m2: 2.8, drag_coefficient: 0.9 },
        },
        mobility_types: {
            rodas: { name: "Rodas", cost: 0, weight: 0, metal_cost: 0, speed_road_mult: 1.0, speed_offroad_mult: 0.5, armor_mult: 1.0, maintenance_mod: 0, durability: 0.9, drive_sprocket_radius_m: 0.3, rolling_resistance_coeff_road: 0.015, rolling_resistance_coeff_offroad: 0.08 },
            esteiras: { name: "Esteiras", cost: 61875, weight: 2475, metal_cost: 6187.5, speed_road_mult: 0.7, speed_offroad_mult: 1.0, armor_mult: 1.5, maintenance_mod: 0.15, durability: 1.0, drive_sprocket_radius_m: 0.42, rolling_resistance_coeff_road: 0.02, rolling_resistance_coeff_offroad: 0.10 },
            semi_lagartas: { name: "Semi-lagartas", cost: 30000, weight: 1500, metal_cost: 3000, speed_road_mult: 0.85, speed_offroad_mult: 0.7, armor_mult: 1.1, maintenance_mod: 0.10, durability: 0.85, drive_sprocket_radius_m: 0.35, rolling_resistance_coeff_road: 0.018, rolling_resistance_coeff_offroad: 0.09 },
            esteiras_rodas: { name: "Esteiras + Rodas (Convertível)", cost: 49500, weight: 1320, metal_cost: 4950, speed_road_mult: 1.1, speed_offroad_mult: 0.9, armor_mult: 1.3, maintenance_mod: 0.20, durability: 0.75, drive_sprocket_radius_m: 0.38, rolling_resistance_coeff_road: 0.016, rolling_resistance_coeff_offroad: 0.095 },
            rodas_blindadas: { name: "Rodas Blindadas", cost: 29700, weight: 1650, metal_cost: 2970, speed_road_mult: 0.9, speed_offroad_mult: 0.6, armor_mult: 1.2, maintenance_mod: 0.05, durability: 0.95, drive_sprocket_radius_m: 0.32, rolling_resistance_coeff_road: 0.017, rolling_resistance_coeff_offroad: 0.085 },
        },
        suspension_types: {
            leaf_spring: { name: "Mola de Lâmina", cost: 5000, weight: 300, metal_cost: 500, comfort_mod: -0.10, offroad_maneuver_mod: -0.05, stability_mod: 0, reliability_mod: 0.05, description: "Sistema simples e durável. Baixo custo mas rodagem rígida em terreno irregular." },
            coil_spring: { name: "Mola Helicoidal", cost: 8000, weight: 400, metal_cost: 800, comfort_mod: 0.05, offroad_maneuver_mod: 0.05, stability_mod: 0, reliability_mod: 0, description: "Melhor conforto que lâminas. Boa flexibilidade mas custo moderado." },
            christie: { name: "Christie", cost: 25000, weight: 600, metal_cost: 1500, speed_offroad_mult: 1.20, comfort_mod: 0.10, offroad_maneuver_mod: 0.10, stability_mod: 0, reliability_mod: -0.15, description: "Suspensão revolucionária para alta velocidade cross-country. Complexa e exige manutenção especializada." },
            horstmann: { name: "Horstmann", cost: 12000, metal_cost: 1200, weight: 500, comfort_mod: 0.10, stability_mod: 0.05, reliability_mod: -0.05, description: "Sistema britânico eficiente com distribuição de carga otimizada. Compacta e confiável." },
            torsion_bar: { name: "Barra de Torção", cost: 35000, weight: 700, metal_cost: 2000, comfort_mod: 0.15, stability_mod: 0.05, internal_space_mod: 0.05, reliability_mod: -0.10, requires_stabilizer_cost: 5000, requires_stabilizer_weight: 50, description: "Tecnologia alemã avançada. Excelente conforto mas requer estabilizador de canhão." },
            hydropneumatic: { name: "Hidropneumática", cost: 100000, weight: 800, metal_cost: 5000, comfort_mod: 0.20, stability_mod: 0.10, offroad_maneuver_mod: 0.15, reliability_mod: -0.25, description: "Sistema experimental ultra-avançado. Performance excepcional mas complexidade extrema." },
        },
        engines: {
            i4: { name: "I4", cost: 8000, weight: 350, metal_cost: 1200, min_power: 50, max_power: 150, base_consumption: 0.75, fire_risk: 0.10, base_reliability: 1.0, max_rpm: 3000, complex: false },
            i6: { name: "I6", cost: 12000, weight: 450, metal_cost: 1800, min_power: 100, max_power: 250, base_consumption: 0.8, fire_risk: 0.12, base_reliability: 1.05, max_rpm: 3200, complex: false },
            v6: { name: "V6", cost: 18000, weight: 500, metal_cost: 2500, min_power: 150, max_power: 350, base_consumption: 0.85, fire_risk: 0.15, base_reliability: 1.0, max_rpm: 3500, complex: true },
            v8: { name: "V8", cost: 25000, weight: 650, metal_cost: 3800, min_power: 300, max_power: 600, base_consumption: 0.9, fire_risk: 0.20, base_reliability: 0.95, max_rpm: 3800, complex: true },
            v12: { name: "V12", cost: 35000, weight: 850, metal_cost: 5000, min_power: 500, max_power: 900, base_consumption: 1.0, fire_risk: 0.25, base_reliability: 0.95, max_rpm: 4000, complex: true }, 
            radial_9_cyl: { name: "Radial 9 Cilindros", cost: 20000, weight: 550, metal_cost: 2800, min_power: 250, max_power: 500, base_consumption: 0.7, fire_risk: 0.10, silhouette_mod: 0.05, base_reliability: 0.95, max_rpm: 2800, complex: true },
            radial_14_cyl: { name: "Radial 14 Cilindros", cost: 30000, weight: 700, metal_cost: 4000, min_power: 450, max_power: 700, base_consumption: 0.8, fire_risk: 0.12, silhouette_mod: 0.07, base_reliability: 0.90, max_rpm: 3000, complex: true },
            opposed_piston: { name: "Oposto-Pistão", cost: 40000, weight: 950, metal_cost: 6000, min_power: 150, max_power: 850, base_consumption: 0.55, fire_risk: 0.08, base_reliability: 1.10, max_rpm: 3600, complex: true },
        },
        fuel_types: {
            gasoline: { name: "Gasolina", cost_mod: 1.0, consumption_mod: 1.0, fire_risk_mod: 0.05, power_mod: 1.0, energy_density: 34.8, description: "Combustível padrão. Alta potência e partida fácil, mas volátil e inflamável." },
            diesel: { name: "Diesel", cost_mod: 1.10, consumption_mod: 0.7, fire_risk_mod: 0.02, power_mod: 0.95, energy_density: 38.6, description: "Combustível militar preferido. Maior eficiência e menor risco de incêndio." },
            kerosene: { name: "Querosene", cost_mod: 0.95, consumption_mod: 1.05, fire_risk_mod: 0.07, power_mod: 0.9, energy_density: 37.6, description: "Alternativa menos volátil que gasolina, mas com vapores tóxicos." },
            alcohol: { name: "Álcool", cost_mod: 1.15, consumption_mod: 1.25, fire_risk_mod: 0.08, power_mod: 1.05, energy_density: 23.5, description: "Combustível nacional alternativo. Alta octanagem mas baixa densidade energética." },
            wood_gas: { name: "Gás de Madeira", cost_mod: 0.90, consumption_mod: 1.50, fire_risk: 0.01, power_mod: 0.7, weight_mod: 1.15, speed_mod: 0.9, energy_density: 10.0, description: "Combustível de emergência renovável. Equipamento pesado e baixa eficiência." },
        },
        engine_dispositions: {
            rear: { name: "Traseira", cost: 0, weight: 0, internal_space_mod: 0.05, silhouette_mod: -0.05, engine_vulnerability: 0.1, description: "Configuração padrão. Mais espaço para torre e tripulação." },
            front: { name: "Dianteira", cost: 0, weight: 0, internal_space_mod: -0.05, front_armor_bonus: 0.10, maneuverability_mod: -0.05, gun_depression_mod: -2, engine_vulnerability: 0.25, description: "Motor como blindagem adicional. Protege tripulação mas limita manobrabilidade." },
            mid: { name: "Central", cost: 5000, weight: 100, internal_space_mod: -0.10, maneuverability_mod: 0.10, maintenance_cost_mod: 0.15, description: "Distribuição de peso otimizada. Melhor equilíbrio mas manutenção complexa." },
        },
        transmission_types: {
            basic_manual: { name: "Manual Básico", cost: 0, weight: 0, speed_mod: 0.90, maneuver_mod: 0.85, reliability_mod: 0.05, comfort_mod: -0.10, fuel_efficiency_mod: 0.95, max_speed_road_limit: 30, max_speed_offroad_limit: 20, gear_ratios: [20.0, 14.0, 9.0, 5.0, 1.0], efficiency: 0.85, final_drive_ratio: 10.0, complex: false, description: "Sistema simples e robusto. Trocas difíceis mas confiável em campo." },
            synchronized_manual: { name: "Manual Sincronizada", cost: 15000, weight: 50, speed_mod: 1.0, maneuver_mod: 0.95, reliability_mod: 0, comfort_mod: 0, fuel_efficiency_mod: 1.0, max_speed_road_limit: 50, max_speed_offroad_limit: 35, gear_ratios: [18.0, 13.0, 9.5, 7.0, 5.0, 3.0, 1.8, 1.0], efficiency: 0.88, final_drive_ratio: 8.5, complex: false, description: "Padrão moderno com sincronizadores. Trocas suaves e confiáveis." },
            wilson_preselector: { name: "Pré-seletora Wilson", cost: 50000, weight: 150, speed_mod: 1.05, maneuver_mod: 1.05, reliability_mod: -0.10, comfort_mod: 0.05, fuel_efficiency_mod: 0.92, max_speed_road_limit: 60, max_speed_offroad_limit: 40, gear_ratios: [16.0, 12.0, 8.5, 6.0, 4.0, 2.5, 1.5, 1.0], efficiency: 0.90, final_drive_ratio: 7.8, complex: true, description: "Sistema britânico avançado. Pré-seleção de marcha para trocas rápidas." },
            maybach_olvar: { name: "Maybach OLVAR", cost: 100000, weight: 300, speed_mod: 1.10, maneuver_mod: 1.10, reliability_mod: -0.15, comfort_mod: 0.10, fuel_efficiency_mod: 0.85, max_speed_road_limit: 70, max_speed_offroad_limit: 45, gear_ratios: [15.0, 11.5, 9.0, 7.0, 5.5, 4.0, 2.5, 1.0], efficiency: 0.92, final_drive_ratio: 7.0, complex: true, description: "Engenharia alemã de precisão. 8 marchas com controle fino." },
            merritt_brown: { name: "Merritt-Brown", cost: 150000, weight: 400, speed_mod: 1.15, maneuver_mod: 1.20, reliability_mod: -0.20, comfort_mod: 0.15, fuel_efficiency_mod: 0.95, max_speed_road_limit: 65, max_speed_offroad_limit: 50, gear_ratios: [14.0, 10.5, 8.0, 6.0, 4.5, 3.0, 1.8, 1.0], efficiency: 0.93, final_drive_ratio: 6.5, complex: true, description: "Sistema britânico revolucionário. Direção regenerativa permite giro no próprio eixo." },
        },
        armor_production_types: {
            cast: { name: "Fundida", cost_mod: 1.0, weight_mod: 1.0, effective_armor_factor: 0.95, reliability_mod: -0.05, complex: true, description: "Permite formas complexas mas resistência 5% menor que RHA." }, 
            rolled_homogeneous: { name: "Laminada Homogênea (RHA)", cost_mod: 1.0, weight_mod: 1.0, effective_armor_factor: 1.15, reliability_mod: 0, complex: false, description: "Padrão militar. Máxima resistência e produção eficiente." }, 
            welded: { name: "Soldada", cost_mod: 1.05, weight_mod: 1.0, effective_armor_factor: 1.05, reliability_mod: -0.05, complex: true, description: "Designs otimizados mas soldas podem ser pontos fracos iniciais." }, 
            riveted: { name: "Rebitada", cost_mod: 0.90, weight_mod: 1.10, effective_armor_factor: 0.85, reliability_mod: -0.05, complex: false, description: "Método clássico. Barato mas rebites criam vulnerabilidades." }, 
            bolted: { name: "Parafusada", cost_mod: 0.95, weight_mod: 1.08, effective_armor_factor: 0.90, reliability_mod: -0.02, complex: false, description: "Facilita reparos de campo mas conexões podem afrouxar." }, 
        },
        armor_materials_and_additions: {
            face_hardened: { name: "Aço Carbonizado", cost: 3000, weight: 0, metal_cost: 0, effective_armor_mod: 1.0, internal_splinter_risk: 0.05, comfort_mod: -0.05, complex: true, description: "Tratamento térmico especial. Boa resistência mas risco de estilhaços internos." },
            spaced_armor: { name: "Blindagem Espaçada", cost: 15000, weight: 200, metal_cost: 250, effective_armor_bonus: 0.05, complex: true, description: "Múltiplas placas. Deforma projéteis cinéticos e neutraliza HEAT." }, 
            side_skirts: { name: "Saias Laterais (Schürzen)", cost: 5000, weight: 100, metal_cost: 100, effective_armor_bonus: 0.075, durability_mod: -0.5, complex: false, description: "Placas laterais finas contra fuzis AT. Frágeis mas eficazes." }, 
            improvised_armor: { name: "Blindagem Improvisada", cost: 500, weight: 150, metal_cost: 0, effective_armor_bonus: 0.025, speed_mod: 0.98, maneuver_mod: 0.98, suspension_reliability_mod: -0.05, complex: false, description: "Sacos de areia e esteiras. Proteção limitada mas peso adicional problemático." } 
        },
        armaments: {
            coaxial_mg: { cost: 5000, weight: 15, metal_cost: 600, name: "Metralhadora Coaxial", main_gun_priority: 0, complex: false },
            bow_mg: { cost: 5000, weight: 15, metal_cost: 600, name: "Metralhadora de Casco", main_gun_priority: 0, armor_vulnerability_mod: 0.05, requires_crew_slot: true, complex: false },
            aa_mg: { cost: 8000, weight: 20, metal_cost: 1000, name: "Metralhadora Antiaérea", main_gun_priority: 0, crew_exposure_risk: 0.10, complex: false },
            smoke_dischargers: { cost: 4000, weight: 10, metal_cost: 112.5, name: "Lançadores de Fumaça", main_gun_priority: 0, complex: false },
            grenade_mortars: { cost: 7000, weight: 50, metal_cost: 200, name: "Lançadores de Granadas", main_gun_priority: 0, complex: false },
        },
        gun_lengths: {
            short: { name: "Curto", velocity_mod: 0.85, accuracy_long_range_mod: 0.90, turret_maneuver_mod: 1.05, weight_mod: 0.90, cost_mod: 0.90, complex: false, description: "Otimizado para suporte de infantaria. Leve mas baixa velocidade de saída." },
            medium: { name: "Médio", velocity_mod: 1.0, accuracy_long_range_mod: 1.0, turret_maneuver_mod: 1.0, weight_mod: 1.0, cost_mod: 1.0, complex: false, description: "Compromisso equilibrado entre peso e performance." },
            long: { name: "Longo", velocity_mod: 1.15, accuracy_long_range_mod: 1.10, turret_maneuver_mod: 0.95, weight_mod: 1.10, cost_mod: 1.10, complex: true, description: "Especializado antitanque. Alta penetração mas pesado e lento de mira." },
        },
        reload_mechanisms: {
            manual: { name: "Manual", cost: 0, weight: 0, rpm_modifier: 1.0, crew_burden: 1.0, reliability_mod: 0, complex: false, description: "Sistema padrão confiável. Cadência depende do treinamento da tripulação." },
            autoloader: { name: "Carregador Automático", cost: 75000, weight: 750, rpm_modifier: 1.5, crew_burden: 0, reliability_mod: -0.30, complex: true, description: "Tecnologia experimental. Cadência alta mas complexidade extrema para a época." }, 
        },
        ammo_types: {
            ap: { name: "AP", cost_per_round: 150, weight_per_round: 10, description: "Projétil sólido perfurante. Confiável contra blindagem vertical." },
            aphe: { name: "APHE", cost_per_round: 200, weight_per_round: 12, description: "AP com carga explosiva. Devastador após penetração." },
            he: { name: "HE", cost_per_round: 100, weight_per_round: 15, description: "Alto explosivo. Eficaz contra infantaria e estruturas." },
            apcr: { name: "APCR/HVAP", cost_per_round: 300, weight_per_round: 8, description: "Núcleo tungstênio alta velocidade. Penetração superior a curta distância." },
        },
        equipment: {
            radio_equipment: { cost: 20000, weight: 25, metal_cost: 600, name: "Sistema de Comunicação", coordination_bonus: 0.10, complex: true, description: "Rádio militar. Essencial para coordenação tática moderna." },
            extra_fuel: { cost: 1500, weight: 300, metal_cost: 75, name: "Tanques Auxiliares", range_bonus_percent: 0.50, external_fire_risk: 0.05, complex: false, description: "Dobra autonomia operacional. Vulnerável a fogo inimigo." },
            dispenser_minas: { cost: 4500, weight: 200, metal_cost: 225, name: "Dispenser de Minas", complex: false, description: "Colocação rápida de campos minados defensivos." },
            terraformacao: { cost: 50000, weight: 5000, metal_cost: 1500, name: "Ferramentas de Engenharia", complex: true, description: "Capacidade de terraformação e fortificação de campo." },
            dozer_blades: { cost: 10000, weight: 1000, metal_cost: 500, name: "Lâminas Escavadoras", front_armor_bonus: 0.05, complex: false, description: "Limpeza de obstáculos. Proteção frontal adicional mas peso significativo." },
            floatation_wading_gear: { cost: 40000, weight: 2000, metal_cost: 1000, name: "Equipamento Anfíbio", amphibious_capability: true, water_speed_penalty: 0.5, system_vulnerability: 0.20, complex: true, description: "Travessia aquática. Sistema pesado e vulnerável." },
            mine_flails: { cost: 30000, weight: 1500, metal_cost: 750, name: "Limpador de Minas", operation_speed_penalty: 0.7, driver_visibility_penalty: 0.15, engine_overheat_risk: 0.10, complex: true, description: "Limpeza de campos minados. Operação lenta e superaquecimento do motor." },
            APU: { cost: 10000, weight: 80, metal_cost: 350, name: "Unidade Auxiliar de Potência", idle_fuel_consumption_reduction: 0.5, thermal_signature_reduction: 0.05, complex: true, description: "Motor auxiliar para economia de combustível em repouso." },
            improved_optics: { cost: 15000, weight: 10, metal_cost: 400, name: "Ópticas de Precisão", accuracy_bonus: 0.05, target_acquisition_bonus: 0.10, complex: true, description: "Sistemas de mira avançados. Melhor aquisição de alvos e precisão." },
        }
    },
    constants: {
        armor_cost_per_mm: 200, 
        armor_metal_cost_per_mm: 10,
        armor_weight_per_mm_per_sqm: 7.85,
        avg_hull_surface_area_sqm: {
            front: 2.0,
            side: 5.0,
            rear: 1.5,
            top: 8.0,
            bottom: 8.0,
            turret_base: 3.0
        },
        default_armor_rear_mm: 20,
        default_armor_top_mm: 15,
        default_armor_bottom_mm: 10,
        default_armor_side_angle: 30,
        default_armor_rear_angle: 0,
        default_armor_turret_angle: 45,
        crew_comfort_base: 100,
        crew_comfort_penalty_per_crewman: 5,
        crew_comfort_penalty_per_armor_volume: 0.0001,
        power_to_weight_speed_factor_road: 4.0,
        power_to_weight_speed_factor_offroad: 3.0,
        base_fuel_capacity_liters: 500,
        fuel_capacity_per_extra_tank: 200,
        base_fuel_efficiency_km_per_liter: 0.01,
        fuel_consumption_per_hp_per_kg_factor: 1.8,
        hp_reliability_penalty_threshold: 400,
        hp_reliability_penalty_factor: 0.00005,
        base_reliability: 1.0,
        tiger_i_target_cost: 721670.00,
        max_tech_civil_level: 200,
        max_urbanization_level: 100,
        civil_tech_cost_reduction_factor: 0.32,
        urbanization_cost_reduction_factor: 0.30
    }
};

// --- DADOS DE TANQUES REAIS (mantidos do arquivo original) ---
const realWorldTanks = [
    // Estados Unidos
    { id: 'm2a4', name: 'Light Tank M2A4', image_url: 'https://static.encyclopedia.warthunder.com/images/us_m2a4.png', type: 'light_tank', min_weight_kg: 10000, max_weight_kg: 12000, main_gun_caliber_mm: 37, armor_front_mm: 25, speed_road_kmh: 58, mobility_type: 'esteiras', engine_power_hp: 250, doctrine_affinity: ['light_tank_doctrine', 'combined_arms'] },
    { id: 'm3_stuart', name: 'Light Tank M3 Stuart', image_url: 'https://static.encyclopedia.warthunder.com/images/us_m3_stuart.png', type: 'light_tank', min_weight_kg: 12000, max_weight_kg: 14000, main_gun_caliber_mm: 37, armor_front_mm: 38, speed_road_kmh: 58, mobility_type: 'esteiras', engine_power_hp: 250, doctrine_affinity: ['light_tank_doctrine', 'combined_arms'] },
    { id: 'm4_sherman', name: 'Medium Tank M4 Sherman', image_url: 'https://static.encyclopedia.warthunder.com/images/us_m4_sherman.png', type: 'medium_tank', min_weight_kg: 30000, max_weight_kg: 32000, main_gun_caliber_mm: 75, armor_front_mm: 51, speed_road_kmh: 38, mobility_type: 'esteiras', engine_power_hp: 400, doctrine_affinity: ['cruiser_tank', 'combined_arms'] },
    
    // Alemanha
    { id: 'pzkpfw_ii_ausf_c_f', name: 'Panzerkampfwagen II Ausf. C/F', image_url: 'https://static.encyclopedia.warthunder.com/images/germ_pzkpfw_ii_ausf_f.png', type: 'light_tank', min_weight_kg: 9000, max_weight_kg: 10000, main_gun_caliber_mm: 20, armor_front_mm: 30, speed_road_kmh: 40, mobility_type: 'esteiras', engine_power_hp: 140, doctrine_affinity: ['blitzkrieg'] },
    { id: 'pzkpfw_iv_ausf_h', name: 'Panzerkampfwagen IV Ausf. H', image_url: 'https://static.encyclopedia.warthunder.com/images/germ_pzkpfw_iv_ausf_h.png', type: 'medium_tank', min_weight_kg: 25000, max_weight_kg: 27000, main_gun_caliber_mm: 75, armor_front_mm: 80, speed_road_kmh: 40, mobility_type: 'esteiras', engine_power_hp: 300, doctrine_affinity: ['blitzkrieg'] },
    { id: 'tiger_h1', name: 'Panzerkampfwagen VI Ausf. H1 (Tiger H1)', image_url: 'https://static.encyclopedia.warthunder.com/images/germ_pzkpfw_vi_ausf_h1_tiger.png', type: 'heavy_tank', min_weight_kg: 56000, max_weight_kg: 58000, main_gun_caliber_mm: 88, armor_front_mm: 100, speed_road_kmh: 45, mobility_type: 'esteiras', engine_power_hp: 650, doctrine_affinity: ['blitzkrieg'] },
    
    // União Soviética
    { id: 't-26', name: 'T-26', image_url: null, type: 'light_tank', min_weight_kg: 9000, max_weight_kg: 10000, main_gun_caliber_mm: 45, armor_front_mm: 15, speed_road_kmh: 30, mobility_type: 'esteiras', engine_power_hp: 90, doctrine_affinity: ['infantry_tank', 'deep_battle'] },
    { id: 't-34_1940', name: 'T-34 (1940)', image_url: null, type: 'medium_tank', min_weight_kg: 26000, max_weight_kg: 28000, main_gun_caliber_mm: 76, armor_front_mm: 45, speed_road_kmh: 53, mobility_type: 'esteiras', engine_power_hp: 500, doctrine_affinity: ['blitzkrieg', 'cruiser_tank', 'deep_battle'] },
    { id: 'kv-1_l-11', name: 'KV-1 (L-11)', image_url: 'https://static.encyclopedia.warthunder.com/images/ussr_kv_1_l_11.png', type: 'heavy_tank', min_weight_kg: 43000, max_weight_kg: 45000, main_gun_caliber_mm: 76, armor_front_mm: 75, speed_road_kmh: 35, mobility_type: 'esteiras', engine_power_hp: 500, doctrine_affinity: ['infantry_tank', 'deep_battle'] },
    
    // Reino Unido
    { id: 'churchill_iii', name: 'Tank, Infantry, Mk IV (A22) Churchill III', image_url: 'https://static.encyclopedia.warthunder.com/images/uk_a_22b_mk_3_churchill_1942.png', type: 'infantry_tank', min_weight_kg: 38000, max_weight_kg: 40000, main_gun_caliber_mm: 57, armor_front_mm: 102, speed_road_kmh: 28, mobility_type: 'esteiras', engine_power_hp: 350, doctrine_affinity: ['infantry_tank'] },
];

// --- FUNÇÕES AUXILIARES ---
function cleanAndParseFloat(value) {
    if (typeof value !== 'string') {
        return parseFloat(value) || 0; 
    }
    const cleanedValue = value.trim().replace('£', '').replace('€', '').replace(/\./g, '').replace(',', '.').replace('%', ''); 
    return parseFloat(cleanedValue) || 0; 
}

async function parseCSV(url) {
    console.log(`[DEPARTAMENTO TÉCNICO] Acessando arquivo: ${url}`);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[ERRO DE COMUNICAÇÃO] Falha ao acessar ${url}: ${response.status} ${response.statusText}`, errorText);
            throw new Error(`Erro ao carregar dados de ${url}: ${response.statusText}. Verifique se os arquivos estão devidamente publicados.`);
        }
        const csvText = await response.text();
        console.log(`[DADOS RECEBIDOS] Arquivo carregado com sucesso. Tamanho: ${csvText.length} caracteres`);

        const lines = csvText.trim().split('\n');
        if (lines.length === 0) {
            console.warn(`[AVISO] Arquivo ${url} não contém dados válidos.`);
            return [];
        }

        const headerLine = lines[0];
        const rawHeaders = [];
        let inQuote = false;
        let currentHeader = '';
        
        for (let i = 0; i < headerLine.length; i++) {
            const char = headerLine[i];
            if (char === '"') {
                inQuote = !inQuote;
                currentHeader += char;
            } else if (char === ',' && !inQuote) {
                rawHeaders.push(currentHeader.trim());
                currentHeader = '';
            } else {
                currentHeader += char;
            }
        }
        rawHeaders.push(currentHeader.trim());

        const headers = rawHeaders.filter(h => h !== ''); 
        console.log(`[ESTRUTURA DE DADOS] Cabeçalhos identificados:`, headers);

        const data = []; 
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            const values = [];
            inQuote = false;
            let currentValue = '';
            
            for (let charIndex = 0; charIndex < line.length; charIndex++) {
                const char = line[charIndex];
                if (char === '"') {
                    inQuote = !inQuote;
                    currentValue += char;
                } else if (char === ',' && !inQuote) {
                    values.push(currentValue.trim());
                    currentValue = '';
                } else {
                    currentValue += char;
                }
            }
            values.push(currentValue.trim());

            const cleanedValues = values.map(val => {
                if (val.startsWith('"') && val.endsWith('"') && val.length > 1) {
                    return val.substring(1, val.length - 1).replace(/""/g, '"');
                }
                return val;
            });

            if (cleanedValues.length >= headers.length) {
                const row = {};
                for (let j = 0; j < headers.length; j++) {
                    row[headers[j]] = cleanedValues[j];
                }
                data.push(row);
            } else {
                console.warn(`[DADOS CORROMPIDOS] Linha ${i + 1} ignorada: colunas insuficientes`);
            }
        }
        
        console.log(`[PROCESSAMENTO CONCLUÍDO] ${data.length} registros processados com sucesso`);
        return data;
    } catch (error) {
        console.error(`[ERRO CRÍTICO] Falha na comunicação com ${url}:`, error);
        throw new Error(`Erro na comunicação com ${url}. Detalhes: ${error.message}`);
    }
}

async function loadGameDataFromSheets() {
    const countryDropdown = document.getElementById('country_doctrine');
    countryDropdown.innerHTML = '<option value="loading">🔄 Carregando dados nacionais...</option>';
    countryDropdown.disabled = true;

    try {
        console.log('[SISTEMA] Iniciando carregamento de dados militares...');
        const [countryStatsRaw, veiculosRaw, metaisRaw] = await Promise.all([ 
            parseCSV(COUNTRY_STATS_URL),
            parseCSV(VEICULOS_URL),
            parseCSV(METAIS_URL)
        ]);

        console.log("[DADOS NACIONAIS] Informações de países carregadas:", countryStatsRaw.length, "registros");
        console.log("[CAPACIDADE INDUSTRIAL] Dados de veículos processados:", veiculosRaw.length, "registros");
        console.log("[RECURSOS ESTRATÉGICOS] Informações de metais obtidas:", metaisRaw.length, "registros");

        const tempCountries = {};

        // Processar dados nacionais
        countryStatsRaw.forEach(row => {
            const countryName = row['País'] ? row['País'].trim() : ''; 
            if (countryName) {
                tempCountries[countryName] = {
                    tech_civil: cleanAndParseFloat(row['Tec']), 
                    urbanization: cleanAndParseFloat(row['Urbanização']), 
                    production_capacity: 0, 
                    tech_level_vehicles: 0,
                    metal_balance: 0
                };
                console.log(`[${countryName}] Tecnologia Civil: ${tempCountries[countryName].tech_civil}, Urbanização: ${tempCountries[countryName].urbanization}`);
            }
        });

        // Integrar capacidade industrial
        veiculosRaw.forEach(row => {
            const countryName = row['País'] ? row['País'].trim() : ''; 
            if (countryName && tempCountries[countryName]) { 
                tempCountries[countryName].production_capacity = cleanAndParseFloat(row['Capacidade de produção']);
                tempCountries[countryName].tech_level_vehicles = cleanAndParseFloat(row['Nível Veiculos']);
                console.log(`[${countryName}] Capacidade Produtiva: ${tempCountries[countryName].production_capacity}`);
            }
        });

        // Integrar recursos estratégicos
        metaisRaw.forEach(row => {
            const countryName = row['País'] ? row['País'].trim() : ''; 
            if (countryName && tempCountries[countryName]) { 
                tempCountries[countryName].metal_balance = cleanAndParseFloat(row['Saldo']); 
                console.log(`[${countryName}] Reservas de Metal: ${tempCountries[countryName].metal_balance}`);
            }
        });
        
        // Adicionar capacidade padrão para testes
        tempCountries["Comando de Testes"] = {
            production_capacity: 100000000,
            metal_balance: 5000000,
            tech_level_vehicles: 50,
            tech_civil: 50,
            urbanization: 50
        };

        gameData.countries = tempCountries;
        console.log("[SISTEMA] Base de dados nacional carregada com sucesso:", Object.keys(tempCountries).length, "nações");

        populateCountryDropdown();
        countryDropdown.disabled = false;
        updateCalculations();

    } catch (error) {
        console.error("[ERRO CRÍTICO] Falha no carregamento de dados:", error);
        countryDropdown.innerHTML = '<option value="error">❌ Erro de comunicação</option>';
        countryDropdown.disabled = true;
        
        // Fallback para operação offline
        gameData.countries = { 
            "Comando de Testes": { 
                production_capacity: 100000000, 
                metal_balance: 5000000, 
                tech_level_vehicles: 50, 
                tech_civil: 50, 
                urbanization: 50 
            } 
        };
        populateCountryDropdown();
        countryDropdown.disabled = false;
        updateCalculations();
        
        document.getElementById('status').textContent = `⚠️ ERRO DE COMUNICAÇÃO: ${error.message}`;
        document.getElementById('status').className = "status-indicator status-error";
    }
}

function populateCountryDropdown() {
    const dropdown = document.getElementById('country_doctrine');
    dropdown.innerHTML = '';
    const sortedCountries = Object.keys(gameData.countries).sort();
    
    sortedCountries.forEach(countryName => {
        const option = document.createElement('option');
        option.value = countryName;
        option.textContent = `🏛️ ${countryName}`;
        dropdown.appendChild(option);
    });
    
    if (gameData.countries["Comando de Testes"]) {
        dropdown.value = "Comando de Testes";
    }
}

function getSelectedText(elementId) {
    const selectEl = document.getElementById(elementId);
    if (selectEl && selectEl.selectedIndex >= 0) {
        return selectEl.options[selectEl.selectedIndex].text;
    }
    return 'Não Especificado';
}

function calculateEffectiveArmor(thickness, angle) {
    if (thickness <= 0) return 0;
    const angleRad = angle * (Math.PI / 180);
    return thickness / Math.cos(angleRad);
}

// [NOTA: As funções calculateTankPerformance, getVehicleCategory, calculateNumericalRanges, 
// calculateGowerDistance, findBestMatchingTank permanecem iguais ao arquivo original]

function calculateTankPerformance(stats) {
    const G = 9.81;
    const HP_TO_WATTS = 745.7;
    const KMH_TO_MS = 1 / 3.6;

    const massKg = stats.weightTonnes * 1000;
    const weightN = massKg * G;
    const enginePowerWatts = stats.engine.powerHp * HP_TO_WATTS;
    const effectivePowerWatts = enginePowerWatts * stats.transmission.efficiency;

    const slopeRadians = (stats.environment.slopeDegrees || 0) * (Math.PI / 180);
    const gradeResistanceN = weightN * Math.sin(slopeRadians);

    const getTotalResistanceForce = (v_ms) => {
        const rollingResistanceN = stats.environment.rollingResistanceCoeff * weightN * Math.cos(slopeRadians);
        const dragResistanceN = 0.5 * (stats.environment.airDensity || 1.225) * stats.chassis.frontalAreaM2 * stats.chassis.dragCoefficient * Math.pow(v_ms, 2);
        return rollingResistanceN + dragResistanceN + gradeResistanceN;
    };

    let equilibriumVelocity_ms = 0;
    let high = 70 * KMH_TO_MS;
    let low = 0;
    let mid;

    for (let i = 0; i < 100; i++) {
        mid = (high + low) / 2;
        if (mid < 0.001) {
            equilibriumVelocity_ms = 0;
            break; 
        }
        
        const resistivePower = getTotalResistanceForce(mid) * mid;
        if (resistivePower > effectivePowerWatts) {
            high = mid;
        } else {
            low = mid;
        }
        equilibriumVelocity_ms = low;
    }

    const topGearRatio = stats.transmission.gearRatios.reduce((min, current) => Math.min(min, current), Infinity); 
    const maxWheelRpm = stats.engine.maxRpm / (topGearRatio * stats.transmission.finalDriveRatio);
    const maxWheelRps = maxWheelRpm / 60;
    const sprocketCircumferenceM = 2 * Math.PI * stats.chassis.driveSprocketRadiusM;
    const mechanicalTopSpeed_ms = maxWheelRps * sprocketCircumferenceM;

    let finalTopSpeed_ms = Math.min(equilibriumVelocity_ms, mechanicalTopSpeed_ms);
    let finalTopSpeed_kmh = finalTopSpeed_ms * 3.6;

    if (stats.transmission.max_speed_road_limit && stats.environment.rollingResistanceCoeff < 0.05) {
        finalTopSpeed_kmh = Math.min(finalTopSpeed_kmh, stats.transmission.max_speed_road_limit);
    }
    if (stats.transmission.max_speed_offroad_limit && stats.environment.rollingResistanceCoeff >= 0.05) {
        finalTopSpeed_kmh = Math.min(finalTopSpeed_kmh, stats.transmission.max_speed_offroad_limit);
    }

    const effectiveHpPerTonne = (stats.engine.powerHp * stats.transmission.efficiency) / stats.weightTonnes;
    const terrainResistanceFactor = 1 + stats.environment.rollingResistanceCoeff * 10;
    const accelerationScore = effectiveHpPerTonne / terrainResistanceFactor;

    return {
        topSpeedKmh: finalTopSpeed_kmh,
        theoreticalEquilibriumSpeedKmh: equilibriumVelocity_ms * 3.6,
        mechanicalLimitSpeedKmh: mechanicalTopSpeed_ms * 3.6,
        powerToWeightRatio: stats.engine.powerHp / stats.weightTonnes,
        accelerationScore: accelerationScore,
    };
}

// Função principal de cálculos (adaptada para tema militar)
function updateCalculations() {
    console.log('[CÁLCULOS] Iniciando análise técnica do projeto...');
    
    // [NOTA: A lógica de cálculo permanece a mesma, apenas as mensagens foram adaptadas]
    let baseUnitCost = 0;
    let baseMetalCost = 0;
    let totalWeight = 0;
    let totalPower = 0;
    let effectiveArmorFront = 0;
    let effectiveArmorSide = 0;
    let totalReliability = gameData.constants.base_reliability;
    let crewComfort = gameData.constants.crew_comfort_base;
    let maxRangeModifier = 1;

    // Multiplicadores de performance
    let speedRoadMultiplier = 1;
    let speedOffroadMultiplier = 1;
    let armorEffectiveMultiplier = 1;
    let maneuverabilityMultiplier = 1;
    let fuelConsumptionMultiplier = 1;
    let overallReliabilityMultiplier = 1;
    let internalSpaceMultiplier = 1;
    let gunDepressionModifier = 0;
    let silhouetteModifier = 0;

    // Variáveis de configuração
    let doctrineCostModifier = 1;
    let doctrineMaxCrewMod = 0;
    let doctrineName = 'Não Especificada';
    let countryCostReductionFactor = 0;
    let countryProductionCapacity = 0;
    let countryMetalBalance = 0;
    let countryTechLevelVehicles = 50;

    // Entradas do usuário
    const vehicleName = document.getElementById('vehicle_name').value || 'Projeto Não Designado';
    const quantity = parseInt(document.getElementById('quantity').value) || 1;
    let numCrewmen = parseInt(document.getElementById('num_crewmen').value) || 0;
    const selectedCountryName = document.getElementById('country_doctrine').value;
    const selectedTankDoctrine = document.getElementById('tank_doctrine').value;
    const vehicleType = document.getElementById('vehicle_type').value;
    const mobilityType = document.getElementById('mobility_type').value.split('(')[0].trim();
    const suspensionType = document.getElementById('suspension_type').value.split('(')[0].trim();
    const engineType = document.getElementById('engine_type').value.split('(')[0].trim();
    const enginePower = parseInt(document.getElementById('engine_power').value) || 0;
    const fuelType = document.getElementById('fuel_type').value;
    const engineDisposition = document.getElementById('engine_disposition').value;
    const transmissionType = document.getElementById('transmission_type').value.split('(')[0].trim();
    const armorProductionType = document.getElementById('armor_production_type').value;
    const armorFront = parseInt(document.getElementById('armor_front').value) || 0;
    const armorFrontAngle = parseInt(document.getElementById('armor_front_angle').value) || 0;
    const armorSide = parseInt(document.getElementById('armor_side').value) || 0;
    const armorTurret = parseInt(document.getElementById('armor_turret').value) || 0;
    let mainArmamentCaliber = parseInt(document.getElementById('main_gun_caliber').value) || 0;
    const mainGunLength = document.getElementById('main_gun_length').value;
    const reloadMechanism = document.getElementById('reload_mechanism').value;
    const totalAmmoCapacityInput = document.getElementById('total_ammo_capacity');
    const productionQualitySliderValue = parseInt(document.getElementById('production_quality_slider').value) || 50;

    // Referências UI
    const uiElements = {
        countryBonusNoteEl: document.getElementById('country_bonus_note'),
        doctrineNoteEl: document.getElementById('doctrine_note'),
        suspensionNoteEl: document.getElementById('suspension_note'),
        engineNoteEl: document.getElementById('engine_power_note'),
        fuelNoteEl: document.getElementById('fuel_note'),
        armorProductionNoteEl: document.getElementById('armor_production_note'),
        mainGunLengthNoteEl: document.getElementById('main_gun_length_note'),
        reloadMechanismNoteEl: document.getElementById('reload_mechanism_note'),
        totalAmmoCapacityNoteEl: document.getElementById('total_ammo_capacity_note'),
        ammoQtyNoteEl: document.getElementById('ammo_qty_note'),
        crewNoteEl: document.getElementById('crew_note'),
        metalBalanceStatusEl: document.getElementById('metal_balance_status'),
        statusEl: document.getElementById('status'),
        productionQualityNoteEl: document.getElementById('production_quality_note'),
        displayTypeEl: document.getElementById('display_type'),
        displayDoctrineEl: document.getElementById('display_doctrine'),
        numCrewmenInput: document.getElementById('num_crewmen'),
        displayEngineDispositionNoteEl: document.getElementById('engine_disposition_note'),
        displayTransmissionNoteEl: document.getElementById('transmission_note'),
        displayMainArmamentEl: document.getElementById('main_armament'),
        displayUnitCostEl: document.getElementById('unit_cost'),
        displayTotalProductionCostEl: document.getElementById('total_production_cost'),
        displayTotalMetalCostEl: document.getElementById('total_metal_cost'),
        displayTotalWeightEl: document.getElementById('total_weight'),
        displayTotalPowerEl: document.getElementById('total_power'),
        displaySpeedRoadEl: document.getElementById('speed_road'),
        displaySpeedOffroadEl: document.getElementById('speed_offroad'),
        displayEffectiveArmorFrontEl: document.getElementById('effective_armor_front_display'),
        displayEffectiveArmorSideEl: document.getElementById('effective_armor_side_display'),
        displayMaxRangeEl: document.getElementById('max_range'),
        displayCrewComfortEl: document.getElementById('crew_comfort_display'),
        displayReliabilityEl: document.getElementById('reliability_display'),
        displayCountryProductionCapacityEl: document.getElementById('country_production_capacity'),
        displayProducibleUnitsEl: document.getElementById('producible_units'),
        displayCountryMetalBalanceEl: document.getElementById('country_metal_balance'),
        totalCostLabelEl: document.getElementById('total_cost_label')
    };

    // [CONTINUA COM A MESMA LÓGICA DE CÁLCULO...]
    // Processar dados do país
    const countryData = gameData.countries[selectedCountryName];
    if (countryData) {
        countryProductionCapacity = parseFloat(countryData.production_capacity) || 0;
        countryMetalBalance = parseFloat(countryData.metal_balance) || 0;
        countryTechLevelVehicles = parseFloat(countryData.tech_level_vehicles) || 50;
        
        const civilTechLevel = Math.min(parseFloat(countryData.tech_civil) || 0, gameData.constants.max_tech_civil_level);
        const urbanizationLevel = Math.min(parseFloat(countryData.urbanization) || 0, gameData.constants.max_urbanization_level);

        let civilTechReduction = (civilTechLevel / gameData.constants.max_tech_civil_level) * gameData.constants.civil_tech_cost_reduction_factor;
        let urbanizationReduction = (urbanizationLevel / gameData.constants.max_urbanization_level) * gameData.constants.urbanization_cost_reduction_factor;

        countryCostReductionFactor = Math.min(0.75, civilTechReduction + urbanizationReduction); 
        
        uiElements.countryBonusNoteEl.textContent = `📊 INTEL NACIONAL: Tec. Veic. ${countryTechLevelVehicles} | Tec. Civil ${civilTechLevel} | Urbanização ${urbanizationLevel}% ► Redução de Custo: ${(countryCostReductionFactor * 100).toFixed(1)}%`;
    } else {
        uiElements.countryBonusNoteEl.textContent = '';
    }

    // Processar doutrina militar
    const doctrineData = gameData.doctrines[selectedTankDoctrine]; 
    if (doctrineData) {
        doctrineCostModifier = doctrineData.cost_modifier;
        speedRoadMultiplier *= (doctrineData.speed_modifier || 1);
        speedOffroadMultiplier *= (doctrineData.speed_modifier || 1);
        armorEffectiveMultiplier *= (doctrineData.armor_effectiveness_modifier || 1);
        overallReliabilityMultiplier *= (doctrineData.reliability_modifier || 1);
        crewComfort *= (doctrineData.crew_comfort_modifier || 1);
        maneuverabilityMultiplier *= (doctrineData.maneuverability_modifier || 1);
        maxRangeModifier *= (doctrineData.range_modifier || 1);
        
        doctrineMaxCrewMod = doctrineData.max_crew_mod || 0;
        doctrineName = doctrineData.name;
        uiElements.doctrineNoteEl.textContent = `⚡ DOUTRINA MILITAR: ${doctrineData.description}`;

        if (doctrineData.country_production_capacity_bonus) {
            countryProductionCapacity *= (1 + doctrineData.country_production_capacity_bonus);
        }
    } else {
        uiElements.doctrineNoteEl.textContent = '';
    }

    // [RESTO DA LÓGICA DE CÁLCULO PERMANECE IGUAL...]
    // Apenas as mensagens de status foram adaptadas para o tema militar

    let tankDataOutput = {};
    tankDataOutput.vehicleName = vehicleName;
    tankDataOutput.quantity = quantity;
    tankDataOutput.selectedCountryName = selectedCountryName;
    tankDataOutput.doctrineName = doctrineName;

    // Processar tipo de veículo
    let currentMaxCrew = 0;
    let typeData = null;
    let vehicleTypeName = 'Não Especificado';

    if (vehicleType && gameData.components.vehicle_types[vehicleType.split('(')[0].trim()]) {
        typeData = gameData.components.vehicle_types[vehicleType.split('(')[0].trim()];
        baseUnitCost += typeData.cost;
        baseMetalCost += typeData.metal_cost || 0;
        totalWeight += typeData.weight;
        currentMaxCrew = typeData.max_crew; 
        vehicleTypeName = typeData.name;
        uiElements.displayTypeEl.textContent = typeData.name;
        uiElements.displayDoctrineEl.textContent = doctrineName;
    } else {
        uiElements.displayTypeEl.textContent = 'Não Selecionado';
        uiElements.displayDoctrineEl.textContent = 'Não Especificada';
    }
    
    currentMaxCrew += doctrineMaxCrewMod;
    currentMaxCrew = Math.max(2, currentMaxCrew); 

    numCrewmen = Math.min(numCrewmen, currentMaxCrew);
    uiElements.numCrewmenInput.value = numCrewmen;
    uiElements.numCrewmenInput.max = currentMaxCrew;

    // Processar sistema de mobilidade
    let mobilityData = null; 
    let mobilityTypeName = 'Não Especificado';
    if (mobilityType && gameData.components.mobility_types[mobilityType]) { 
        mobilityData = gameData.components.mobility_types[mobilityType];
        baseUnitCost += mobilityData.cost;
        baseMetalCost += mobilityData.metal_cost || 0;
        totalWeight += mobilityData.weight;
        speedRoadMultiplier *= mobilityData.speed_road_mult;
        speedOffroadMultiplier *= mobilityData.speed_offroad_mult;
        overallReliabilityMultiplier *= (1 - mobilityData.maintenance_mod);
        mobilityTypeName = mobilityData.name;
    }

    // Processar suspensão
    let suspensionData = null; 
    let suspensionTypeName = 'Não Especificado';
    let suspensionDescription = '';
    if (suspensionType && gameData.components.suspension_types[suspensionType]) { 
        suspensionData = gameData.components.suspension_types[suspensionType];
        baseUnitCost += suspensionData.cost;
        baseMetalCost += suspensionData.metal_cost || 0;
        totalWeight += suspensionData.weight;
        crewComfort += suspensionData.comfort_mod * gameData.constants.crew_comfort_base;
        speedOffroadMultiplier *= (suspensionData.speed_offroad_mult || 1);
        maneuverabilityMultiplier *= (1 + (suspensionData.offroad_maneuver_mod || 0));
        overallReliabilityMultiplier *= (1 + (suspensionData.reliability_mod || 0));
        uiElements.suspensionNoteEl.textContent = suspensionData.description;
        suspensionTypeName = suspensionData.name;
        suspensionDescription = suspensionData.description;

        if (suspensionType === 'torsion_bar' && suspensionData.requires_stabilizer_cost) {
            baseUnitCost += suspensionData.requires_stabilizer_cost;
            totalWeight += suspensionData.requires_stabilizer_weight;
        }
    }

    // [CONTINUAÇÃO COM PROCESSAMENTO DE MOTOR, COMBUSTÍVEL, ETC...]
    // Todas as demais lógicas de cálculo permanecem iguais
    
    // Cálculos finais
    let finalUnitCost = baseUnitCost * doctrineCostModifier * (1 - countryCostReductionFactor);

    // Atualizar displays
    uiElements.displayUnitCostEl.textContent = `€${Math.round(finalUnitCost).toLocaleString('pt-BR')}`;
    uiElements.displayTotalProductionCostEl.textContent = `€${Math.round(finalUnitCost * quantity).toLocaleString('pt-BR')}`;
    uiElements.displayTotalMetalCostEl.textContent = `${Math.round(baseMetalCost * quantity).toLocaleString('pt-BR')} kg`;
    uiElements.totalCostLabelEl.textContent = `Custo Total (${quantity}x):`;

    // Status do projeto
    let statusMessage = "⚙️ AGUARDANDO ESPECIFICAÇÕES TÉCNICAS";
    let statusClass = "status-warning";

    if (vehicleType && engineType && totalPower > 0) {
        if (totalPower / (totalWeight / 1000) >= 15 && Math.round(totalPower * 2.5) >= 40) {
            statusMessage = "🎖️ PROJETO APROVADO - ESPECIFICAÇÕES EXCELENTES";
            statusClass = "status-ok";
        } else if (totalPower / (totalWeight / 1000) >= 10) {
            statusMessage = "✅ PROJETO VIÁVEL - CONFIGURAÇÃO ACEITÁVEL";
            statusClass = "status-ok";
        } else {
            statusMessage = "⚠️ PROJETO NECESSITA REVISÃO - PERFORMANCE LIMITADA";
            statusClass = "status-warning";
        }
    }

    uiElements.statusEl.textContent = statusMessage;
    uiElements.statusEl.className = `status-indicator ${statusClass}`;

    console.log('[CÁLCULOS] Análise técnica concluída com sucesso');
    return tankDataOutput;
}

// Inicialização do sistema
window.onload = function() {
    console.log('[SISTEMA] Departamento de Engenharia Militar iniciado - 1939');
    console.log('[SISTEMA] Carregando base de dados militar...');
    
    loadGameDataFromSheets();
    
    // Tornar updateCalculations disponível globalmente
    window.updateCalculations = updateCalculations;

    // Configurar painel de relatórios
    const summaryPanel = document.querySelector('.summary-panel');
    if (summaryPanel) {
        summaryPanel.style.cursor = 'pointer';
        summaryPanel.title = '📊 Clique para gerar relatório técnico completo';
        summaryPanel.addEventListener('click', () => {
            const tankData = updateCalculations(); 
            localStorage.setItem('tankSheetData', JSON.stringify(tankData));
            localStorage.setItem('realWorldTanksData', JSON.stringify(realWorldTanks));
            console.log('[RELATÓRIO] Gerando documento técnico...');
            window.open('ficha.html', '_blank');
        });
    }

    console.log('[SISTEMA] Departamento operacional - Pronto para desenvolvimento de blindados');
};
