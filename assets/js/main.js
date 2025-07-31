// assets/js/main.js

// --- CONFIGURAÇÃO DA PLANILHA DO GOOGLE SHEETS ---
const COUNTRY_STATS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR5Pw3aRXSTIGMglyNAUNqLtOl7wjX9bMeFXEASkQYC34g_zDyDx3LE8Vm73FUoNn27UAlKLizQBXBO/pub?gid=0&single=true&output=csv';
const METAIS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR5Pw3aRXSTIGMglyNAUNqLtOl7wjX9bMeFXEASkQYC34g_zDyDx3LE8Vm73FUoNn27UAlKLizQBXBO/pub?gid=1505649898&single=true&output=csv';
const VEICULOS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR5Pw3aRXSTIGMglyNAUNqLtOl7wjX9bMeFXEASkQYC34g_zDyDx3LE8Vm73FUoNn27UAlKLizQBXBO/pub?gid=1616220418&single=true&output=csv';

// --- DADOS DO JOGO ---
const gameData = {
    countries: {}, // Será preenchido dinamicamente
    doctrines: {
        infantry_tank: {
            name: "Tanque de Infantaria",
            description: "Concebido para operar em estreita coordenação com a infantaria, priorizando blindagem pesada contra armas antitanque e metralhadoras. Velocidade sacrificada em prol da proteção. Ex: Matilda II.",
            cost_modifier: 1.30, // +30%
            speed_modifier: 0.60, // -40%
            armor_effectiveness_modifier: 1.15, // +15%
            reliability_modifier: 1.05, // +5%
            crew_comfort_modifier: 1.05, // +5%
            max_crew_mod: 0,
            armor_cost_weight_reduction_percent: 0.10, 
            durability_bonus: 0.05, 
            infantry_moral_bonus: 0.10, 
            speed_penalty: 0.20, 
            maneuverability_penalty: 0.10, 
        },
        cruiser_tank: {
            name: "Tanque Cruzador",
            description: "Projetado para perseguição e exploração, exigindo alta velocidade e manobrabilidade. Tipicamente blindado de forma mais leve e equipado com armamento antitanque. Ex: Tanques Christie, Vickers Medium Mk II.",
            cost_modifier: 1.10, // +10%
            speed_modifier: 1.35, // +35%
            armor_effectiveness_modifier: 0.95, // -5%
            reliability_modifier: 0.95, // -5%
            maneuverability_modifier: 1.10, // +10%
            max_crew_mod: 0,
            engine_cost_weight_reduction_percent: 0.15, 
            range_bonus: 0.10, 
            initiative_bonus: 0.15, 
            armor_cost_weight_increase_percent: 0.05, 
            offroad_speed_penalty: 0.05, 
        },
        light_tank_doctrine: {
            name: "Doutrina de Tanques Leves",
            description: "Primariamente destinado a funções de reconhecimento e constabularia, com o custo sendo o principal fator de design. Blindagem e armamento limitados. Ex: Vickers-Armstrong Light Tank.",
            cost_modifier: 0.75, // -25%
            speed_modifier: 1.15, // +15%
            armor_effectiveness_modifier: 0.85, // -15%
            reliability_modifier: 1.05, // +5%
            max_crew_mod: -2,
            cost_reduction_percent: 0.15, 
            metal_efficiency_bonus: 0.10, 
            production_speed_bonus: 0.10, 
            max_main_gun_caliber_limit: 75, 
            secondary_armament_limit_penalty: 1, 
        },
        blitzkrieg: {
            name: "Blitzkrieg (Alemanha)",
            description: "Filosofia operacional que prioriza mobilidade, coordenação e reação rápida. Enfatiza motores confiáveis, rádios e ópticas de alta qualidade. Ex: Panzer IV, T-34 (inspirado na mobilidade).",
            cost_modifier: 1.05, // +5%
            speed_modifier: 1.20, // +20%
            reliability_modifier: 1.10, // +10%
            crew_comfort_modifier: 1.05, // +5%
            armor_effectiveness_modifier: 0.98, // -2%
            optics_radio_bonus_multiplier: 0.02, 
            max_crew_mod: 0,
            advanced_component_cost_increase: 0.10, 
            quality_production_slider_bias: 0.10, 
        },
        deep_battle: { 
            name: "Batalha Profunda (URSS)",
            description: "Foco na produção em massa, simplicidade e capacidade de avanço rápido. Prioriza quantidade e robustez operacional.",
            cost_modifier: 0.85, // -15%
            reliability_modifier: 0.95, // -5%
            country_production_capacity_bonus: 0.10, // +10%
            armor_effectiveness_modifier: 1.05, // +5%
            speed_modifier: 1.10, // +10%
            crew_comfort_modifier: 0.90, // -10%
            max_crew_mod: 0,
            base_comfort_penalty: 0.10, 
            complex_component_reliability_penalty: 0.15, 
            production_quality_slider_bias: -0.10, 
        },
        combined_arms: { 
            name: "Armas Combinadas (EUA)",
            description: "Enfatiza versatilidade, conforto da tripulação e suporte logístico. Tanques equilibrados e fáceis de operar.",
            cost_modifier: 1.10, // +10%
            reliability_modifier: 1.05, // +5%
            crew_comfort_modifier: 1.15, // +15%
            speed_modifier: 1.10, // +10%
            range_modifier: 1.10, // +10%
            country_production_capacity_bonus: 0.05, // +5%
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
            leaf_spring: { name: "Mola de Lâmina", cost: 5000, weight: 300, metal_cost: 500, comfort_mod: -0.10, offroad_maneuver_mod: -0.05, stability_mod: 0, reliability_mod: 0.05, description: "Durável, simples, barato, mas rodagem rígida e pouca articulação." },
            coil_spring: { name: "Mola Helicoidal", cost: 8000, weight: 400, metal_cost: 800, comfort_mod: 0.05, offroad_maneuver_mod: 0.05, stability_mod: 0, reliability_mod: 0, description: "Melhor conforto que lâmina, boa flexibilidade e controle. Mais cara." },
            christie: { name: "Christie", cost: 25000, weight: 600, metal_cost: 1500, speed_offroad_mult: 1.20, comfort_mod: 0.10, offroad_maneuver_mod: 0.10, stability_mod: 0, reliability_mod: -0.15, description: "Velocidade cross-country excepcional, boa mobilidade. Complexa, manutenção difícil, ocupa espaço interno." },
            horstmann: { name: "Horstmann", cost: 12000, metal_cost: 1200, weight: 500, comfort_mod: 0.10, stability_mod: 0.05, reliability_mod: -0.05, description: "Distribuição de carga eficaz, maior curso, fácil manutenção em campo. Compacta." },
            torsion_bar: { name: "Barra de Torção", cost: 35000, weight: 700, metal_cost: 2000, comfort_mod: 0.15, stability_mod: 0.05, internal_space_mod: 0.05, reliability_mod: -0.10, requires_stabilizer_cost: 5000, requires_stabilizer_weight: 50, description: "Rodagem suave, durabilidade, pouco volume interno. Risco de quebra, exige estabilizador de canhão." },
            hydropneumatic: { name: "Hidropneumática", cost: 100000, weight: 800, metal_cost: 5000, comfort_mod: 0.20, stability_mod: 0.10, offroad_maneuver_mod: 0.15, reliability_mod: -0.25, description: "Grande agilidade, melhor tração, estabilização de armas. Muito cara, complexa, menor vida útil, super-engenharia para o período." },
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
            gasoline: { name: "Gasolina", cost_mod: 1.0, consumption_mod: 1.0, fire_risk_mod: 0.05, power_mod: 1.0, energy_density: 34.8, description: "Padrão. Alta potência, partida fácil, mas volátil e inflamável." },
            diesel: { name: "Diesel", cost_mod: 1.10, consumption_mod: 0.7, fire_risk_mod: 0.02, power_mod: 0.95, energy_density: 38.6, description: "Maior eficiência, alto torque, menor inflamabilidade. Mais pesado e caro inicialmente." },
            kerosene: { name: "Querosene", cost_mod: 0.95, consumption_mod: 1.05, fire_risk_mod: 0.07, power_mod: 0.9, energy_density: 37.6, description: "Menos volátil que gasolina, mas tóxico e menor potência." },
            alcohol: { name: "Álcool", cost_mod: 1.15, consumption_mod: 1.25, fire_risk_mod: 0.08, power_mod: 1.05, energy_density: 23.5, description: "Maior octanagem, pode ser produzido localmente. Baixa densidade energética, corrosivo, caro." },
            wood_gas: { name: "Gás de Madeira", cost_mod: 0.90, consumption_mod: 1.50, fire_risk: 0.01, power_mod: 0.7, weight_mod: 1.15, speed_mod: 0.9, energy_density: 10.0, description: "Recurso renovável, baixo custo. Baixa potência, equipamento pesado, ineficiente, reduz velocidade." },
        },
        engine_dispositions: {
            rear: { name: "Traseira", cost: 0, weight: 0, internal_space_mod: 0.05, silhouette_mod: -0.05, engine_vulnerability: 0.1, description: "Mais espaço para torre/combate, silhueta baixa, fácil manutenção. Menor proteção para motor." },
            front: { name: "Dianteira", cost: 0, weight: 0, internal_space_mod: -0.05, front_armor_bonus: 0.10, maneuverability_mod: -0.05, gun_depression_mod: -2, engine_vulnerability: 0.25, description: "Proteção adicional para tripulação (motor como blindagem). Dificulta manobrabilidade, maior chance de dano ao motor, limita depressão do canhão." },
            mid: { name: "Central", cost: 5000, weight: 100, internal_space_mod: -0.10, maneuverability_mod: 0.10, maintenance_cost_mod: 0.15, description: "Melhor distribuição de peso, manuseio e aceleração. Reduz espaço interno e dificulta manutenção." },
        },
        transmission_types: {
            basic_manual: { name: "Manual Básico (Caixa Seca)", cost: 0, weight: 0, speed_mod: 0.90, maneuver_mod: 0.85, reliability_mod: 0.05, comfort_mod: -0.10, fuel_efficiency_mod: 0.95, max_speed_road_limit: 30, max_speed_offroad_limit: 20, gear_ratios: [20.0, 14.0, 9.0, 5.0, 1.0], efficiency: 0.85, final_drive_ratio: 10.0, complex: false, description: "Simples e robusta. Trocas de marcha difíceis, perda de potência em curvas, alta fadiga do motorista. Comum em veículos iniciais." },
            synchronized_manual: { name: "Manual Sincronizada", cost: 15000, weight: 50, speed_mod: 1.0, maneuver_mod: 0.95, reliability_mod: 0, comfort_mod: 0, fuel_efficiency_mod: 1.0, max_speed_road_limit: 50, max_speed_offroad_limit: 35, gear_ratios: [18.0, 13.0, 9.5, 7.0, 5.0, 3.0, 1.8, 1.0], efficiency: 0.88, final_drive_ratio: 8.5, complex: false, description: "Melhora a facilidade e suavidade das trocas de marcha. Padrão para muitos veículos da Segunda Guerra Mundial." },
            wilson_preselector: { name: "Pré-seletora Wilson", cost: 50000, weight: 150, speed_mod: 1.05, maneuver_mod: 1.05, reliability_mod: -0.10, comfort_mod: 0.05, fuel_efficiency_mod: 0.92, max_speed_road_limit: 60, max_speed_offroad_limit: 40, gear_ratios: [16.0, 12.0, 8.5, 6.0, 4.0, 2.5, 1.5, 1.0], efficiency: 0.90, final_drive_ratio: 7.8, complex: true, description: "Permite pré-selecionar a próxima marcha. Trocas rápidas e suaves, reduz fadiga do motorista. Complexa e mais cara. Usada em tanques britânicos." },
            maybach_olvar: { name: "Maybach OLVAR (OG 40 12 16 B)", cost: 100000, weight: 300, speed_mod: 1.10, maneuver_mod: 1.10, reliability_mod: -0.15, comfort_mod: 0.10, fuel_efficiency_mod: 0.85, max_speed_road_limit: 70, max_speed_offroad_limit: 45, gear_ratios: [15.0, 11.5, 9.0, 7.0, 5.5, 4.0, 2.5, 1.0], efficiency: 0.92, final_drive_ratio: 7.0, complex: true, description: "Transmissão pré-seletora complexa com 8 marchas à frente. Usada em tanques alemães como o Tiger I/II. Oferece bom controle, mas é cara e exige manutenção." },
            merritt_brown: { name: "Merritt-Brown (TN.12)", cost: 150000, weight: 400, speed_mod: 1.15, maneuver_mod: 1.20, reliability_mod: -0.20, comfort_mod: 0.15, fuel_efficiency_mod: 0.95, max_speed_road_limit: 65, max_speed_offroad_limit: 50, gear_ratios: [14.0, 10.5, 8.0, 6.0, 4.5, 3.0, 1.8, 1.0], efficiency: 0.93, final_drive_ratio: 6.5, complex: true, description: "Sistema diferencial triplo com direção regenerativa. Permite curvas com potência total e giro no próprio eixo. Altamente manobrável, mas muito complexa e cara. Usada em tanques britânicos." },
        },
        armor_production_types: {
            cast: { name: "Fundida", cost_mod: 1.0, weight_mod: 1.0, effective_armor_factor: 0.95, reliability_mod: -0.05, complex: true, description: "Formas complexas/curvas, menos soldas. Menos resistente que RHA, difícil tratamento térmico." }, 
            rolled_homogeneous: { name: "Laminada Homogênea (RHA)", cost_mod: 1.0, weight_mod: 1.0, effective_armor_factor: 1.15, reliability_mod: 0, complex: false, description: "Padrão da indústria. Mais resistente, produção em massa. Resulta em designs mais 'quadrados', mais soldas." }, 
            welded: { name: "Soldada", cost_mod: 1.05, weight_mod: 1.0, effective_armor_factor: 1.05, reliability_mod: -0.05, complex: true, description: "Permite designs complexos/eficientes. Soldas podem ser pontos fracos (qualidade inicial), exige mão de obra qualificada." }, 
            riveted: { name: "Rebitada", cost_mod: 0.90, weight_mod: 1.10, effective_armor_factor: 0.85, reliability_mod: -0.05, complex: false, description: "Placas unidas por rebites. Mais barato, mas rebites criam pontos fracos e podem se soltar sob impacto. Risco de estilhaços internos." }, 
            bolted: { name: "Parafusada", cost_mod: 0.95, weight_mod: 1.08, effective_armor_factor: 0.90, reliability_mod: -0.02, complex: false, description: "Placas unidas por parafusos. Permite reparos mais fáceis, mas parafusos podem ser pontos fracos e se afrouxar. Menor risco de estilhaços que rebitada." }, 
        },
        armor_materials_and_additions: { 
            face_hardened: { name: "Aço Carbonizado", cost: 3000, weight: 0, metal_cost: 0, effective_armor_mod: 1.0, internal_splinter_risk: 0.05, comfort_mod: -0.05, complex: true, description: "Superfície dura, núcleo macia. Boa resistência contra projéteis iniciais, mas propenso a estilhaços internos, perigoso para tripulação." },
            spaced_armor: { name: "Blindagem Espaçada", cost: 15000, weight: 200, metal_cost: 250, effective_armor_bonus: 0.05, complex: true, description: "Duas ou mais placas com espaço. Pode deformar projéteis cinéticos e detonar HEAT prematuramente. Adiciona peso e complexidade." }, 
            side_skirts: { name: "Saias Laterais (Schürzen)", cost: 5000, weight: 100, metal_cost: 100, effective_armor_bonus: 0.075, durability_mod: -0.5, complex: false, description: "Placas finas laterais para deter fuzis AT e estilhaços. Frágeis e adicionam peso." }, 
            improvised_armor: { name: "Blindagem Improvisada (Sacos de Areia/Esteiras)", cost: 500, weight: 150, metal_cost: 0, effective_armor_bonus: 0.025, speed_mod: 0.98, maneuver_mod: 0.98, suspension_reliability_mod: -0.05, complex: false, description: "Materiais como sacos de arena/elos de esteira. Proteção limitada contra projéteis leves/estilhaços. Peso adicional pode sobrecarregar suspensão e trem de força." } 
        },
        armaments: { 
            coaxial_mg: { cost: 5000, weight: 15, metal_cost: 600, name: "Metralhadora Coaxial", main_gun_priority: 0, complex: false },
            bow_mg: { cost: 5000, weight: 15, metal_cost: 600, name: "Metralhadora de Casco", main_gun_priority: 0, armor_vulnerability_mod: 0.05, requires_crew_slot: true, complex: false },
            aa_mg: { cost: 8000, weight: 20, metal_cost: 1000, name: "Metralhadora Antiaérea", main_gun_priority: 0, crew_exposure_risk: 0.10, complex: false },
            smoke_dischargers: { cost: 4000, weight: 10, metal_cost: 112.5, name: "Lançadores de Fumaça", main_gun_priority: 0, complex: false },
            grenade_mortars: { cost: 7000, weight: 50, metal_cost: 200, name: "Lançadores de Granadas/Morteiros", main_gun_priority: 0, complex: false },
        },
        gun_lengths: {
            short: { name: "Curto", velocity_mod: 0.85, accuracy_long_range_mod: 0.90, turret_maneuver_mod: 1.05, weight_mod: 0.90, cost_mod: 0.90, complex: false, description: "Leve, manobrável, silhueta baixa. Baixa penetração, trajetória curva, flash alto. Melhor para suporte de infantaria e combate CQC." },
            medium: { name: "Médio", velocity_mod: 1.0, accuracy_long_range_mod: 1.0, turret_maneuver_mod: 1.0, weight_mod: 1.0, cost_mod: 1.0, complex: false, description: "Equilíbrio, versatilidade." },
            long: { name: "Longo", velocity_mod: 1.15, accuracy_long_range_mod: 1.10, turret_maneuver_mod: 0.95, weight_mod: 1.10, cost_mod: 1.10, complex: true, description: "Alta velocidade de saída, melhor penetração, trajetória plana. Pesado, longo, silhueta alta, exige mais tempo de mira. Melhor para combate antitanque a longa distância." },
        },
        reload_mechanisms: {
            manual: { name: "Manual", cost: 0, weight: 0, rpm_modifier: 1.0, crew_burden: 1.0, reliability_mod: 0, complex: false, description: "Simples, barato, leve. Cadência de tiro depende da tripulação e calibre, fadiga." },
            autoloader: { name: "Autoloader", cost: 75000, weight: 750, rpm_modifier: 1.5, crew_burden: 0, reliability_mod: -0.30, complex: true, description: "Cadência de tiro consistente e alta, reduz tripulação. Muito caro, pesado, complexo, propenso a falhas (para o período)." }, 
        },
        ammo_types: {
            ap: { name: "AP", cost_per_round: 150, weight_per_round: 10, description: "Projétil sólido de aço endurecido para penetrar blindagem por energia cinética." },
            aphe: { name: "APHE", cost_per_round: 200, weight_per_round: 12, description: "Projétil AP com pequena carga explosiva interna que detona após a penetração." },
            he: { name: "HE", cost_per_round: 100, weight_per_round: 15, description: "Projétil com grande carga explosiva, eficaz contra infantaria e fortificações." },
            apcr: { name: "APCR/HVAP", cost_per_round: 300, weight_per_round: 8, description: "Projétil com núcleo de alta densidade disparado em alta velocidade. Excelente penetração a curta/média distância." },
        },
        equipment: {
            radio_equipment: { cost: 20000, weight: 25, metal_cost: 600, name: "Rádio", coordination_bonus: 0.10, complex: true, description: "Melhora drasticamente a coordenação tática e a comunicação. Ocupa espaço." },
            extra_fuel: { cost: 1500, weight: 300, metal_cost: 75, name: "Tanques Extras de Combustível", range_bonus_percent: 0.50, external_fire_risk: 0.05, complex: false, description: "Aumenta significativamente o raio de ação. Vulneráveis a fogo inimigo, podem vazar ou pegar fogo externamente." },
            dispenser_minas: { cost: 4500, weight: 200, metal_cost: 225, name: "Dispenser de Minas", complex: false, description: "Permite a colocação rápida de campos minados para defesa ou armadilha." },
            terraformacao: { cost: 50000, weight: 5000, metal_cost: 1500, name: "Ferramentas de Engenharia (Terraformação)", complex: true, description: 'Capacidades de engenharia como \'cavar trincheiras\' ou \'remover obstáculos\'.' },
            dozer_blades: { cost: 10000, weight: 1000, metal_cost: 500, name: "Lâminas de Escavadeira", front_armor_bonus: 0.05, complex: false, description: "Permite limpeza de obstáculos e criação de posições defensivas. Proteção frontal adicional. Adiciona peso significativo." },
            floatation_wading_gear: { cost: 40000, weight: 2000, metal_cost: 1000, name: "Flutuadores/Wading Gear", amphibious_capability: true, water_speed_penalty: 0.5, system_vulnerability: 0.20, complex: true, description: "Habilita capacidade anfíbia. Adiciona peso e volume massivos, tornando o tanque lento na água e vulnerável." },
            mine_flails: { cost: 30000, weight: 1500, metal_cost: 750, name: "Equipamento de Limpeza de Minas", operation_speed_penalty: 0.7, driver_visibility_penalty: 0.15, engine_overheat_risk: 0.10, complex: true, description: "Limpa campos minados. Lento, ruidoso, pode cegar motorista e superaquecer motor." },
            APU: { cost: 10000, weight: 80, metal_cost: 350, name: "Unidade de Potência Auxiliar (APU)", idle_fuel_consumption_reduction: 0.5, thermal_signature_reduction: 0.05, complex: true, description: "Pequeno motor secundário. Reduz consumo de combustível e assinatura IR em modo estacionário. Adiciona complexidade." },
            improved_optics: { cost: 15000, weight: 10, metal_cost: 400, name: "Ópticas Melhoradas", accuracy_bonus: 0.05, target_acquisition_bonus: 0.10, complex: true, description: "Sistemas de mira e observação de alta qualidade. Melhoram aquisição de alvos, precisão e consciência situacional." },
        }
    },
    crew_roles: {
        commander: { name: "Comandante", base_efficiency: 1.0 },
        gunner: { name: "Artilheiro", base_efficiency: 1.0 },
        loader: { name: "Municiador", base_efficiency: 1.0 },
        driver: { name: "Motorista", base_efficiency: 1.0 },
        radio_operator_bow_gunner: { name: "Operador de Rádio/Metralhador de Casco", base_efficiency: 1.0 },
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

        base_max_crew_by_type: {
            tankette: 2,
            armored_car: 3,
            halftrack: 3,
            carro_combate: 4,
            transporte_infantaria: 3,
            tanque_leve: 3,
            tanque_medio: 5,
            tanque_pesado: 5, 
            super_pesado: 6,
            multi_turret_tank: 6,
            tank_destroyer: 4,
            assault_gun: 4,
            command_vehicle: 3,
            engineering_vehicle: 3,
            artilharia_simples: 2,
            artilharia_autopropulsada: 4,
            artilharia_antiaerea: 3,
            aa_autopropulsada: 3,
        },
        max_tech_civil_level: 200, 
        max_urbanization_level: 100, 
        civil_tech_cost_reduction_factor: 0.32, 
        urbanization_cost_reduction_factor: 0.30 
    }
};

// --- DADOS DE TANQUES REAIS ---
const realWorldTanks = [
    { id: 'm2a4', name: 'Light Tank M2A4', image_url: 'https://static.encyclopedia.warthunder.com/images/us_m2a4.png', type: 'light_tank', min_weight_kg: 10000, max_weight_kg: 12000, main_gun_caliber_mm: 37, armor_front_mm: 25, speed_road_kmh: 58, mobility_type: 'esteiras', engine_power_hp: 250, doctrine_affinity: ['light_tank_doctrine', 'combined_arms'] },
    { id: 'm3_stuart', name: 'Light Tank M3 Stuart', image_url: 'https://static.encyclopedia.warthunder.com/images/us_m3_stuart.png', type: 'light_tank', min_weight_kg: 12000, max_weight_kg: 14000, main_gun_caliber_mm: 37, armor_front_mm: 38, speed_road_kmh: 58, mobility_type: 'esteiras', engine_power_hp: 250, doctrine_affinity: ['light_tank_doctrine', 'combined_arms'] },
    { id: 'm22_locust', name: 'Light Tank M22 Locust', image_url: 'https://static.encyclopedia.warthunder.com/images/us_m22_locust.png', type: 'light_tank', min_weight_kg: 7000, max_weight_kg: 8000, main_gun_caliber_mm: 37, armor_front_mm: 25, speed_road_kmh: 64, mobility_type: 'esteiras', engine_power_hp: 162, doctrine_affinity: ['light_tank_doctrine', 'combined_arms'] },
    { id: 'm5a1_stuart', name: 'Light Tank M5A1 Stuart', image_url: 'https://static.encyclopedia.warthunder.com/images/us_m5a1_stuart.png', type: 'light_tank', min_weight_kg: 15000, max_weight_kg: 16000, main_gun_caliber_mm: 37, armor_front_mm: 64, speed_road_kmh: 58, mobility_type: 'esteiras', engine_power_hp: 280, doctrine_affinity: ['light_tank_doctrine', 'combined_arms'] },
    { id: 'm4_sherman', name: 'Medium Tank M4 Sherman', image_url: 'https://static.encyclopedia.warthunder.com/images/us_m4_sherman.png', type: 'medium_tank', min_weight_kg: 30000, max_weight_kg: 32000, main_gun_caliber_mm: 75, armor_front_mm: 51, speed_road_kmh: 38, mobility_type: 'esteiras', engine_power_hp: 400, doctrine_affinity: ['cruiser_tank', 'combined_arms'] },
    { id: 'm4a1_sherman', name: 'Medium Tank M4A1 Sherman', image_url: 'https://static.encyclopedia.warthunder.com/images/us_m4a1_1942_sherman.png', type: 'medium_tank', min_weight_kg: 30000, max_weight_kg: 32000, main_gun_caliber_mm: 75, armor_front_mm: 51, speed_road_kmh: 38, mobility_type: 'esteiras', engine_power_hp: 400, doctrine_affinity: ['cruiser_tank', 'combined_arms'] },
    { id: 'm4a2_sherman', name: 'Medium Tank M4A2 Sherman', image_url: 'https://static.encyclopedia.warthunder.com/images/us_m4a2_sherman.png', type: 'medium_tank', min_weight_kg: 31000, max_weight_kg: 33000, main_gun_caliber_mm: 75, armor_front_mm: 64, speed_road_kmh: 42, mobility_type: 'esteiras', engine_power_hp: 410, doctrine_affinity: ['cruiser_tank', 'combined_arms'] },
    { id: 'm6a1', name: 'Heavy Tank M6A1', image_url: 'https://static.encyclopedia.warthunder.com/images/us_m6a1.png', type: 'heavy_tank', min_weight_kg: 57000, max_weight_kg: 60000, main_gun_caliber_mm: 76, armor_front_mm: 102, speed_road_kmh: 35, mobility_type: 'esteiras', engine_power_hp: 960, doctrine_affinity: ['combined_arms'] },
    { id: 'm10_gmc', name: '3-inch Gun Motor Carriage M10', image_url: 'https://static.encyclopedia.warthunder.com/images/us_m10.png', type: 'tank_destroyer', min_weight_kg: 28000, max_weight_kg: 30000, main_gun_caliber_mm: 76, armor_front_mm: 57, speed_road_kmh: 48, mobility_type: 'esteiras', engine_power_hp: 375, doctrine_affinity: ['combined_arms'] },
    { id: 'm18_hellcat', name: '76mm Gun Motor Carriage M18 "Hellcat"', image_url: 'https://static.encyclopedia.warthunder.com/images/us_m18_hellcat.png', type: 'tank_destroyer', min_weight_kg: 17000, max_weight_kg: 19000, main_gun_caliber_mm: 76, armor_front_mm: 13, speed_road_kmh: 89, mobility_type: 'esteiras', engine_power_hp: 400, doctrine_affinity: ['cruiser_tank', 'combined_arms'] },
    { id: 'm36_jackson', name: '90mm Gun Motor Carriage M36', image_url: 'https://static.encyclopedia.warthunder.com/images/us_m36.png', type: 'tank_destroyer', min_weight_kg: 29000, max_weight_kg: 31000, main_gun_caliber_mm: 90, armor_front_mm: 64, speed_road_kmh: 48, mobility_type: 'esteiras', engine_power_hp: 400, doctrine_affinity: ['combined_arms'] },
    { id: 'm8_hmc_scott', name: '75mm Howitzer Motor Carriage M8 "Scott"', image_url: 'https://static.encyclopedia.warthunder.com/images/us_m8_scott.png', type: 'spg', min_weight_kg: 15000, max_weight_kg: 16000, main_gun_caliber_mm: 75, armor_front_mm: 44, speed_road_kmh: 56, mobility_type: 'esteiras', engine_power_hp: 250, doctrine_affinity: ['combined_arms'] },
    { id: 'lvt_a_1', name: 'Landing Vehicle Tracked (Armored) Mark 1', image_url: 'https://static.encyclopedia.warthunder.com/images/us_lvt_a_1.png', type: 'amphibious_vehicle', min_weight_kg: 15000, max_weight_kg: 16000, main_gun_caliber_mm: 37, armor_front_mm: 12, speed_road_kmh: 40, mobility_type: 'esteiras', engine_power_hp: 250, doctrine_affinity: ['combined_arms'] },
    { id: 'lvt_a_4', name: 'Landing Vehicle Tracked (Armored) Mark 4', image_url: 'https://static.encyclopedia.warthunder.com/images/us_lvt_a_4.png', type: 'amphibious_vehicle', min_weight_kg: 17000, max_weight_kg: 18000, main_gun_caliber_mm: 75, armor_front_mm: 12, speed_road_kmh: 32, mobility_type: 'esteiras', engine_power_hp: 262, doctrine_affinity: ['combined_arms'] },
    { id: 'pzkpfw_ii_ausf_c_f', name: 'Panzerkampfwagen II Ausf. C/F', image_url: 'https://static.encyclopedia.warthunder.com/images/germ_pzkpfw_ii_ausf_f.png', type: 'light_tank', min_weight_kg: 9000, max_weight_kg: 10000, main_gun_caliber_mm: 20, armor_front_mm: 30, speed_road_kmh: 40, mobility_type: 'esteiras', engine_power_hp: 140, doctrine_affinity: ['blitzkrieg'] },
    { id: 'pzkpfw_iii_e', name: 'Panzerkampfwagen III Ausf. E', image_url: 'https://static.encyclopedia.warthunder.com/images/germ_pzkpfw_iii_ausf_e.png', type: 'medium_tank', min_weight_kg: 20000, max_weight_kg: 22000, main_gun_caliber_mm: 37, armor_front_mm: 30, speed_road_kmh: 68, mobility_type: 'esteiras', engine_power_hp: 300, doctrine_affinity: ['blitzkrieg'] },
    { id: 'pzkpfw_iii_m', name: 'Panzerkampfwagen III Ausf. M', image_url: 'https://static.encyclopedia.warthunder.com/images/germ_pzkpfw_iii_ausf_m.png', type: 'medium_tank', min_weight_kg: 22000, max_weight_kg: 24000, main_gun_caliber_mm: 50, armor_front_mm: 50, speed_road_kmh: 40, mobility_type: 'esteiras', engine_power_hp: 300, doctrine_affinity: ['blitzkrieg'] },
    { id: 'pzkpfw_iv_ausf_h', name: 'Panzerkampfwagen IV Ausf. H', image_url: 'https://static.encyclopedia.warthunder.com/images/germ_pzkpfw_iv_ausf_h.png', type: 'medium_tank', min_weight_kg: 25000, max_weight_kg: 27000, main_gun_caliber_mm: 75, armor_front_mm: 80, speed_road_kmh: 40, mobility_type: 'esteiras', engine_power_hp: 300, doctrine_affinity: ['blitzkrieg'] },
    { id: 'panther_a', name: 'Panzerkampfwagen V Ausf. A (Panther A)', image_url: 'https://static.encyclopedia.warthunder.com/images/germ_pzkpfw_v_ausf_a_panther.png', type: 'medium_tank', min_weight_kg: 44000, max_weight_kg: 46000, main_gun_caliber_mm: 75, armor_front_mm: 80, speed_road_kmh: 55, mobility_type: 'esteiras', engine_power_hp: 700, doctrine_affinity: ['blitzkrieg'] },
    { id: 'tiger_h1', name: 'Panzerkampfwagen VI Ausf. H1 (Tiger H1)', image_url: 'https://static.encyclopedia.warthunder.com/images/germ_pzkpfw_vi_ausf_h1_tiger.png', type: 'heavy_tank', min_weight_kg: 56000, max_weight_kg: 58000, main_gun_caliber_mm: 88, armor_front_mm: 100, speed_road_kmh: 45, mobility_type: 'esteiras', engine_power_hp: 650, doctrine_affinity: ['blitzkrieg'] },
    { id: 'tiger_ii_b', name: 'Panzerkampfwagen VI Ausf. B (Tiger II)', image_url: 'https://static.encyclopedia.warthunder.com/images/germ_pzkpfw_vi_ausf_b_tiger_iih.png', type: 'heavy_tank', min_weight_kg: 68000, max_weight_kg: 70000, main_gun_caliber_mm: 88, armor_front_mm: 150, speed_road_kmh: 42, mobility_type: 'esteiras', engine_power_hp: 700, doctrine_affinity: ['blitzkrieg'] },
    { id: 'stug_iii_g', name: 'Sturmgeschütz III Ausf. G', image_url: null, type: 'assault_gun', min_weight_kg: 23000, max_weight_kg: 24000, main_gun_caliber_mm: 75, armor_front_mm: 80, speed_road_kmh: 40, mobility_type: 'esteiras', engine_power_hp: 300, doctrine_affinity: ['infantry_tank'] },
    { id: 'stuh_42_g', name: 'Sturmhaubitze 42 Ausf. G', image_url: null, type: 'assault_gun', min_weight_kg: 23000, max_weight_kg: 24000, main_gun_caliber_mm: 105, armor_front_mm: 80, speed_road_kmh: 40, mobility_type: 'esteiras', engine_power_hp: 300, doctrine_affinity: ['infantry_tank'] },
    { id: 'jagdpanzer_iv', name: 'Jagdpanzer IV', image_url: null, type: 'tank_destroyer', min_weight_kg: 24000, max_weight_kg: 26000, main_gun_caliber_mm: 75, armor_front_mm: 80, speed_road_kmh: 40, mobility_type: 'esteiras', engine_power_hp: 300, doctrine_affinity: [] },
    { id: 'hetzer', name: 'Jagdpanzer 38(t) "Hetzer"', image_url: null, type: 'tank_destroyer', min_weight_kg: 15000, max_weight_kg: 16000, main_gun_caliber_mm: 75, armor_front_mm: 60, speed_road_kmh: 42, mobility_type: 'esteiras', engine_power_hp: 150, doctrine_affinity: [] },
    { id: 'ferdinand_elefant', name: 'Ferdinand/Elefant', image_url: null, type: 'tank_destroyer', min_weight_kg: 65000, max_weight_kg: 68000, main_gun_caliber_mm: 88, armor_front_mm: 200, speed_road_kmh: 30, mobility_type: 'esteiras', engine_power_hp: 600, doctrine_affinity: [] },
    { id: 'jagdtiger', name: 'Jagdtiger', image_url: null, type: 'tank_destroyer', min_weight_kg: 70000, max_weight_kg: 72000, main_gun_caliber_mm: 128, armor_front_mm: 250, speed_road_kmh: 34, mobility_type: 'esteiras', engine_power_hp: 700, doctrine_affinity: [] },
    { id: 'jagdpanther_g1', name: 'Jagdpanther G1', image_url: null, type: 'tank_destroyer', min_weight_kg: 45000, max_weight_kg: 47000, main_gun_caliber_mm: 88, armor_front_mm: 80, speed_road_kmh: 55, mobility_type: 'esteiras', engine_power_hp: 700, doctrine_affinity: ['blitzkrieg'] },
    { id: 'wespe', name: 'Wespe', image_url: null, type: 'spg', min_weight_kg: 11000, max_weight_kg: 12000, main_gun_caliber_mm: 105, armor_front_mm: 30, speed_road_kmh: 40, mobility_type: 'esteiras', engine_power_hp: 140, doctrine_affinity: [] },
    { id: 'nashorn', name: 'Nashorn', image_url: null, type: 'spg', min_weight_kg: 24000, max_weight_kg: 25000, main_gun_caliber_mm: 88, armor_front_mm: 30, speed_road_kmh: 42, mobility_type: 'esteiras', engine_power_hp: 300, doctrine_affinity: [] },
    { id: 'hummel', name: 'Hummel', image_url: null, type: 'spg', min_weight_kg: 24000, max_weight_kg: 25000, main_gun_caliber_mm: 150, armor_front_mm: 30, speed_road_kmh: 42, mobility_type: 'esteiras', engine_power_hp: 300, doctrine_affinity: [] },
    { id: 'brummbär', name: 'Brummbär/Sturmpanzer IV', image_url: null, type: 'assault_gun', min_weight_kg: 28000, max_weight_kg: 30000, main_gun_caliber_mm: 150, armor_front_mm: 100, speed_road_kmh: 40, mobility_type: 'esteiras', engine_power_hp: 300, doctrine_affinity: ['infantry_tank'] },
    { id: 'sdkfz_221', name: 'Sd.Kfz. 221', image_url: null, type: 'armored_car', min_weight_kg: 4000, max_weight_kg: 5000, main_gun_caliber_mm: 7.92, armor_front_mm: 14, speed_road_kmh: 90, mobility_type: 'rodas', engine_power_hp: 90, doctrine_affinity: ['blitzkrieg'] },
    { id: 'sdkfz_222', name: 'Sd.Kfz. 222', image_url: null, type: 'armored_car', min_weight_kg: 4500, max_weight_kg: 5500, main_gun_caliber_mm: 20, armor_front_mm: 14, speed_road_kmh: 80, mobility_type: 'rodas', engine_power_hp: 90, doctrine_affinity: ['blitzkrieg'] },
    { id: 'sdkfz_234_puma', name: 'Sd.Kfz. 234 Puma', image_url: null, type: 'armored_car', min_weight_kg: 11000, max_weight_kg: 12000, main_gun_caliber_mm: 50, armor_front_mm: 30, speed_road_kmh: 85, mobility_type: 'rodas', engine_power_hp: 210, doctrine_affinity: ['blitzkrieg'] },
    { id: 't-26', name: 'T-26', image_url: null, type: 'light_tank', min_weight_kg: 9000, max_weight_kg: 10000, main_gun_caliber_mm: 45, armor_front_mm: 15, speed_road_kmh: 30, mobility_type: 'esteiras', engine_power_hp: 90, doctrine_affinity: ['infantry_tank', 'deep_battle'] },
    { id: 'bt-7m', name: 'BT-7M', image_url: null, type: 'light_tank', min_weight_kg: 13000, max_weight_kg: 14000, main_gun_caliber_mm: 45, armor_front_mm: 22, speed_road_kmh: 86, mobility_type: 'esteiras_rodas', engine_power_hp: 500, doctrine_affinity: ['cruiser_tank', 'deep_battle'] },
    { id: 't-70', name: 'T-70', image_url: null, type: 'light_tank', min_weight_kg: 9000, max_weight_kg: 10000, main_gun_caliber_mm: 45, armor_front_mm: 60, speed_road_kmh: 45, mobility_type: 'esteiras', engine_power_hp: 140, doctrine_affinity: ['light_tank_doctrine', 'deep_battle'] },
    { id: 't-34_1940', name: 'T-34 (1940)', image_url: null, type: 'medium_tank', min_weight_kg: 26000, max_weight_kg: 28000, main_gun_caliber_mm: 76, armor_front_mm: 45, speed_road_kmh: 53, mobility_type: 'esteiras', engine_power_hp: 500, doctrine_affinity: ['blitzkrieg', 'cruiser_tank', 'deep_battle'] },
    { id: 't-34-85', name: 'T-34-85', image_url: null, type: 'medium_tank', min_weight_kg: 31000, max_weight_kg: 33000, main_gun_caliber_mm: 85, armor_front_mm: 45, speed_road_kmh: 54, mobility_type: 'esteiras', engine_power_hp: 500, doctrine_affinity: ['blitzkrieg', 'cruiser_tank', 'deep_battle'] },
    { id: 't-44', name: 'T-44', image_url: null, type: 'medium_tank', min_weight_kg: 31000, max_weight_kg: 32000, main_gun_caliber_mm: 85, armor_front_mm: 120, speed_road_kmh: 50, mobility_type: 'esteiras', engine_power_hp: 520, doctrine_affinity: ['blitzkrieg', 'cruiser_tank', 'deep_battle'] },
    { id: 'kv-1_l-11', name: 'KV-1 (L-11)', image_url: 'https://static.encyclopedia.warthunder.com/images/ussr_kv_1_l_11.png', type: 'heavy_tank', min_weight_kg: 43000, max_weight_kg: 45000, main_gun_caliber_mm: 76, armor_front_mm: 75, speed_road_kmh: 35, mobility_type: 'esteiras', engine_power_hp: 500, doctrine_affinity: ['infantry_tank', 'deep_battle'] },
    { id: 'kv-1s', name: 'KV-1S', image_url: null, type: 'heavy_tank', min_weight_kg: 42000, max_weight_kg: 44000, main_gun_caliber_mm: 76, armor_front_mm: 82, speed_road_kmh: 43, mobility_type: 'esteiras', engine_power_hp: 600, doctrine_affinity: ['cruiser_tank', 'deep_battle'] },
    { id: 'kv-2_1939', name: 'KV-2 (1939) "Rei do Derp"', image_url: null, type: 'heavy_tank', min_weight_kg: 52000, max_weight_kg: 54000, main_gun_caliber_mm: 152, armor_front_mm: 75, speed_road_kmh: 35, mobility_type: 'esteiras', engine_power_hp: 500, doctrine_affinity: ['infantry_tank', 'deep_battle'] },
    { id: 'is-2', name: 'IS-2', image_url: null, type: 'heavy_tank', min_weight_kg: 45000, max_weight_kg: 47000, main_gun_caliber_mm: 122, armor_front_mm: 120, speed_road_kmh: 37, mobility_type: 'esteiras', engine_power_hp: 600, doctrine_affinity: ['infantry_tank', 'deep_battle'] },
    { id: 'zis-30', name: 'ZiS-30', image_url: null, type: 'tank_destroyer', min_weight_kg: 4000, max_weight_kg: 5000, main_gun_caliber_mm: 57, armor_front_mm: 10, speed_road_kmh: 40, mobility_type: 'esteiras', engine_power_hp: 50, doctrine_affinity: ['light_tank_doctrine', 'deep_battle'] },
    { id: 'su-76m', name: 'SU-76M', image_url: null, type: 'spg', min_weight_kg: 10000, max_weight_kg: 11000, main_gun_caliber_mm: 76, armor_front_mm: 35, speed_road_kmh: 45, mobility_type: 'esteiras', engine_power_hp: 170, doctrine_affinity: ['deep_battle'] },
    { id: 'su-100', name: 'SU-100', image_url: null, type: 'tank_destroyer', min_weight_kg: 31000, max_weight_kg: 32000, main_gun_caliber_mm: 100, armor_front_mm: 75, speed_road_kmh: 50, mobility_type: 'esteiras', engine_power_hp: 500, doctrine_affinity: ['blitzkrieg', 'deep_battle'] },
    { id: 'su-152', name: 'SU-152 "Zveroboy"', image_url: null, type: 'spg', min_weight_kg: 45000, max_weight_kg: 46000, main_gun_caliber_mm: 152, armor_front_mm: 75, speed_road_kmh: 43, mobility_type: 'esteiras', engine_power_hp: 600, doctrine_affinity: ['infantry_tank', 'deep_battle'] },
    { id: 'churchill_iii', name: 'Tank, Infantry, Mk IV (A22) Churchill III', image_url: 'https://static.encyclopedia.warthunder.com/images/uk_a_22b_mk_3_churchill_1942.png', type: 'infantry_tank', min_weight_kg: 38000, max_weight_kg: 40000, main_gun_caliber_mm: 57, armor_front_mm: 102, speed_road_kmh: 28, mobility_type: 'esteiras', engine_power_hp: 350, doctrine_affinity: ['infantry_tank'] },
    { id: 'churchill_vii', name: 'Tank, Infantry, Mk VII Churchill VII', image_url: null, type: 'infantry_tank', min_weight_kg: 39000, max_weight_kg: 41000, main_gun_caliber_mm: 75, armor_front_mm: 152, speed_road_kmh: 20, mobility_type: 'esteiras', engine_power_hp: 350, doctrine_affinity: ['infantry_tank'] },
    { id: 'cromwell_v', name: 'Tank, Cruiser, Mk VIII, Cromwell V (A27M)', image_url: null, type: 'cruiser_tank', min_weight_kg: 27000, max_weight_kg: 29000, main_gun_caliber_mm: 75, armor_front_mm: 76, speed_road_kmh: 64, mobility_type: 'esteiras', engine_power_hp: 600, doctrine_affinity: ['cruiser_tank'] },
    { id: 'comet_i', name: 'Tank, Cruiser, Mk VIII, Comet I (A34)', image_url: null, type: 'cruiser_tank', min_weight_kg: 32000, max_weight_kg: 34000, main_gun_caliber_mm: 77, armor_front_mm: 102, speed_road_kmh: 50, mobility_type: 'esteiras', engine_power_hp: 600, doctrine_affinity: ['cruiser_tank'] },
    { id: 'valentine', name: 'Tank, Infantry, Mk III Valentine', image_url: null, type: 'infantry_tank', min_weight_kg: 16000, max_weight_kg: 17000, main_gun_caliber_mm: 40, armor_front_mm: 60, speed_road_kmh: 24, mobility_type: 'esteiras', engine_power_hp: 131, doctrine_affinity: ['infantry_tank'] },
    { id: 'matilda_iii', name: 'Tank, Infantry, Mk II Matilda II (A12)', image_url: null, type: 'infantry_tank', min_weight_kg: 26000, max_weight_kg: 28000, main_gun_caliber_mm: 40, armor_front_mm: 78, speed_road: 24, mobility_type: 'esteiras', engine_power_hp: 174, doctrine_affinity: ['infantry_tank'] },
    { id: 'crusader', name: 'Tank, Cruiser, Mk VI Crusader', image_url: null, type: 'cruiser_tank', min_weight_kg: 19000, max_weight_kg: 20000, main_gun_caliber_mm: 40, armor_front_mm: 40, speed_road_kmh: 43, mobility_type: 'esteiras', engine_power_hp: 340, doctrine_affinity: ['cruiser_tank'] },
    { id: 'achilles', name: 'Tank Destroyer, M10 Achilles (17-pdr)', image_url: null, type: 'tank_destroyer', min_weight_kg: 29000, max_weight_kg: 31000, main_gun_caliber_mm: 76, armor_front_mm: 57, speed_road_kmh: 48, mobility_type: 'esteiras', engine_power_hp: 375, doctrine_affinity: [] },
    { id: 'archer', name: 'Tank Destroyer, Self Propelled, Archer', image_url: null, type: 'tank_destroyer', min_weight_kg: 16000, max_weight_kg: 17000, main_gun_caliber_mm: 76, armor_front_mm: 14, speed_road_kmh: 32, mobility_type: 'esteiras', engine_power_hp: 131, doctrine_affinity: [] },
    { id: 'challenger', name: 'Tank, Cruiser, Challenger (A30)', image_url: null, type: 'cruiser_tank', min_weight_kg: 33000, max_weight_kg: 34000, main_gun_caliber_mm: 76, armor_front_mm: 63, speed_road_kmh: 52, mobility_type: 'esteiras', engine_power_hp: 600, doctrine_affinity: ['cruiser_tank'] },
    { id: 'type_97_chi_ha', name: 'Type 97 Medium Tank Chi-Ha', image_url: 'https://static.encyclopedia.warthunder.com/images/jp_type_97_chi_ha.png', type: 'medium_tank', min_weight_kg: 15000, max_weight_kg: 16000, main_gun_caliber_mm: 57, armor_front_mm: 25, speed_road_kmh: 38, mobility_type: 'esteiras', engine_power_hp: 170, doctrine_affinity: [] },
    { id: 'type_97_chi_ha_kai', name: 'Type 97 Medium Tank Chi-Ha Kai', image_url: null, type: 'medium_tank', min_weight_kg: 15000, max_weight_kg: 16000, main_gun_caliber_mm: 47, armor_front_mm: 25, speed_road_kmh: 42, mobility_type: 'esteiras', engine_power_hp: 170, doctrine_affinity: [] },
    { id: 'type_3_chi_nu', name: 'Type 3 Chi-Nu', image_url: null, type: 'medium_tank', min_weight_kg: 18000, max_weight_kg: 19000, main_gun_caliber_mm: 75, armor_front_mm: 50, speed_road_kmh: 39, mobility_type: 'esteiras', engine_power_hp: 240, doctrine_affinity: [] },
    { id: 'type_95_ha_go', name: 'Type 95 Light Tank Ha-Go', image_url: null, type: 'light_tank', min_weight_kg: 7000, max_weight_kg: 8000, main_gun_caliber_mm: 37, armor_front_mm: 12, speed_road_kmh: 45, mobility_type: 'esteiras', engine_power_hp: 120, doctrine_affinity: ['light_tank_doctrine'] },
    { id: 'type_98_ke_ni', name: 'Type 98 Light Tank Ke-Ni', image_url: null, type: 'light_tank', min_weight_kg: 9000, max_weight_kg: 10000, main_gun_caliber_mm: 37, armor_front_mm: 16, speed_road_kmh: 50, mobility_type: 'esteiras', engine_power_hp: 130, doctrine_affinity: ['light_tank_doctrine'] },
    { id: 'type_2_ka_mi', name: 'Type 2 Amphibious Tank Ka-Mi', image_url: 'https://static.encyclopedia.warthunder.com/images/jp_type_2_ka_mi.png', type: 'amphibious_vehicle', min_weight_kg: 12000, max_weight_kg: 13000, main_gun_caliber_mm: 37, armor_front_mm: 50, speed_road_kmh: 37, mobility_type: 'esteiras', engine_power_hp: 120, doctrine_affinity: [] },
    { id: 'type_1_ho_ni_i', name: 'Type 1 Self-Propelled Gun Ho-Ni I', image_url: null, type: 'spg', min_weight_kg: 15000, max_weight_kg: 16000, main_gun_caliber_mm: 75, armor_front_mm: 50, speed_road_kmh: 38, mobility_type: 'esteiras', engine_power_hp: 170, doctrine_affinity: [] },
    { id: 'type_3_ho_ni_iii', name: 'Type 3 Tank Destroyer Ho-Ni III', image_url: null, type: 'tank_destroyer', min_weight_kg: 16000, max_weight_kg: 17000, main_gun_caliber_mm: 75, armor_front_mm: 50, speed_road_kmh: 39, mobility_type: 'esteiras', engine_power_hp: 170, doctrine_affinity: [] },
    { id: 'type_4_ho_ro', name: 'Type 4 Ho-Ro', image_url: null, type: 'spg', min_weight_kg: 16000, max_weight_kg: 17000, main_gun_caliber_mm: 150, armor_front_mm: 25, speed_road_kmh: 38, mobility_type: 'esteiras', engine_power_hp: 170, doctrine_affinity: ['infantry_tank'] },
    { id: 'type_98_ta_se', name: 'Type 98 Self-Propelled Anti-Aircraft Gun Ta-Se', image_url: null, type: 'spaa', min_weight_kg: 4000, max_weight_kg: 5000, main_gun_caliber_mm: 20, armor_front_mm: 12, speed_road_kmh: 45, mobility_type: 'esteiras', engine_power_hp: 120, doctrine_affinity: [] },
    { id: 'l3_33_cc', name: 'L3/33 CC (Carro Veloce)', image_url: 'https://static.encyclopedia.warthunder.com/images/it_l3_cc.png', type: 'tankette', min_weight_kg: 3000, max_weight_kg: 4000, main_gun_caliber_mm: 20, armor_front_mm: 12, speed_road_kmh: 42, mobility_type: 'esteiras', engine_power_hp: 43, doctrine_affinity: ['light_tank_doctrine'] },
    { id: 'l6_40', name: 'L6/40', image_url: 'https://static.encyclopedia.warthunder.com/images/it_l6.png', type: 'light_tank', min_weight_kg: 6000, max_weight_kg: 7000, main_gun_caliber_mm: 20, armor_front_mm: 30, speed_road_kmh: 42, mobility_type: 'esteiras', engine_power_hp: 70, doctrine_affinity: ['light_tank_doctrine'] },
    { id: 'm13_40', name: 'M13/40 (I)', image_url: null, type: 'medium_tank', min_weight_kg: 15000, max_weight_kg: 16000, main_gun_caliber_mm: 47, armor_front_mm: 40, speed_road_kmh: 30, mobility_type: 'esteiras', engine_power_hp: 125, doctrine_affinity: [] },
    { id: 'p40', name: 'P40 (P26/40)', image_url: null, type: 'medium_tank', min_weight_kg: 26000, max_weight_kg: 27000, main_gun_caliber_mm: 75, armor_front_mm: 50, speed_road_kmh: 40, mobility_type: 'esteiras', engine_power_hp: 330, doctrine_affinity: [] },
    { id: 'semovente_75_18_m41', name: 'Semovente da 75/18 M41', image_url: null, type: 'spg', min_weight_kg: 15000, max_weight_kg: 16000, main_gun_caliber_mm: 75, armor_front_mm: 50, speed_road_kmh: 32, mobility_type: 'esteiras', engine_power_hp: 125, doctrine_affinity: ['infantry_tank'] },
    { id: 'autoblinda_41', name: 'Autoblinda 41', image_url: null, type: 'armored_car', min_weight_kg: 7000, max_weight_kg: 8000, main_gun_caliber_mm: 20, armor_front_mm: 14, speed_road_kmh: 78, mobility_type: 'rodas', engine_power_hp: 80, doctrine_affinity: [] },
    { id: 'r_35', name: 'Renault R.35 (SA38)', image_url: null, type: 'light_tank', min_weight_kg: 10000, max_weight_kg: 11000, main_gun_caliber_mm: 37, armor_front_mm: 40, speed_road_kmh: 20, mobility_type: 'esteiras', engine_power_hp: 82, doctrine_affinity: ['infantry_tank'] },
    { id: 'h_39', name: 'Hotchkiss H.39', image_url: null, type: 'light_tank', min_weight_kg: 12000, max_weight_kg: 13000, main_gun_caliber_mm: 37, armor_front_mm: 45, speed_road_kmh: 36, mobility_type: 'esteiras', engine_power_hp: 120, doctrine_affinity: ['infantry_tank'] },
    { id: 'fcm_36', name: 'FCM.36', image_url: null, type: 'light_tank', min_weight_kg: 11000, max_weight_kg: 12000, main_gun_caliber_mm: 37, armor_front_mm: 40, speed_road_kmh: 24, mobility_type: 'esteiras', engine_power_hp: 91, doctrine_affinity: ['infantry_tank'] },
    { id: 'somua_s_35', name: 'SOMUA S.35', image_url: null, type: 'medium_tank', min_weight_kg: 19000, max_weight_kg: 20000, main_gun_caliber_mm: 47, armor_front_mm: 55, speed_road_kmh: 40, mobility_type: 'esteiras', engine_power_hp: 190, doctrine_affinity: ['cruiser_tank'] },
    { id: 'char_b1_bis', name: 'Char B1 bis', image_url: null, type: 'heavy_tank', min_weight_kg: 31000, max_weight_kg: 32000, main_gun_caliber_mm: 75, armor_front_mm: 60, speed_road_kmh: 28, mobility_type: 'esteiras', engine_power_hp: 300, doctrine_affinity: ['infantry_tank'] },
    { id: 'char_2c', name: 'Char 2C', image_url: null, type: 'super_heavy_tank', min_weight_kg: 68000, max_weight_kg: 70000, main_gun_caliber_mm: 75, armor_front_mm: 45, speed_road_kmh: 12, mobility_type: 'esteiras', engine_power_hp: 500, doctrine_affinity: ['infantry_tank'] },
    { id: 'sau_40', name: 'SOMUA SAu 40', image_url: null, type: 'spg', min_weight_kg: 18000, max_weight_kg: 20000, main_gun_caliber_mm: 75, armor_front_mm: 35, speed_road_kmh: 40, mobility_type: 'esteiras', engine_power_hp: 190, doctrine_affinity: [] },
];

// --- FUNÇÕES AUXILIARES ---

function cleanAndParseFloat(value) {
    if (typeof value !== 'string') {
        return parseFloat(value) || 0; 
    }
    const cleanedValue = value.trim().replace('£', '').replace(/\./g, '').replace(',', '.').replace('%', ''); 
    return parseFloat(cleanedValue) || 0; 
}

async function parseCSV(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erro ao carregar CSV de ${url}: ${response.statusText}. Verifique se a planilha está 'Publicada na web' como CSV.`);
        }
        const csvText = await response.text();
        const lines = csvText.trim().split('\n');
        if (lines.length === 0) return [];

        const headerLine = lines[0];
        const rawHeaders = [];
        let inQuote = false;
        let currentHeader = '';
        for (let i = 0; i < headerLine.length; i++) {
            const char = headerLine[i];
            if (char === '"') inQuote = !inQuote;
            else if (char === ',' && !inQuote) {
                rawHeaders.push(currentHeader.trim());
                currentHeader = '';
            } else currentHeader += char;
        }
        rawHeaders.push(currentHeader.trim());

        const headers = rawHeaders.filter(h => h !== ''); 
        const data = []; 
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            const values = [];
            inQuote = false;
            let currentValue = '';
            for (let charIndex = 0; charIndex < line.length; charIndex++) {
                const char = line[charIndex];
                if (char === '"') inQuote = !inQuote;
                else if (char === ',' && !inQuote) {
                    values.push(currentValue.trim());
                    currentValue = '';
                } else currentValue += char;
            }
            values.push(currentValue.trim());

            const cleanedValues = values.map(val => val.startsWith('"') && val.endsWith('"') ? val.substring(1, val.length - 1).replace(/""/g, '"') : val);
            if (cleanedValues.length >= headers.length) {
                const row = {};
                headers.forEach((header, j) => row[header] = cleanedValues[j]);
                data.push(row);
            }
        }
        return data;
    } catch (error) {
        console.error(`Erro na requisição para ${url}:`, error);
        throw error;
    }
}

async function loadGameDataFromSheets() {
    const countryDropdown = document.getElementById('country_doctrine');
    countryDropdown.innerHTML = '<option value="loading">Carregando dados...</option>';
    countryDropdown.disabled = true;

    try {
        const [countryStatsRaw, veiculosRaw, metaisRaw] = await Promise.all([ 
            parseCSV(COUNTRY_STATS_URL),
            parseCSV(VEICULOS_URL),
            parseCSV(METAIS_URL)
        ]);

        const tempCountries = {};
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
            }
        });

        veiculosRaw.forEach(row => {
            const countryName = row['País'] ? row['País'].trim() : ''; 
            if (countryName && tempCountries[countryName]) { 
                tempCountries[countryName].production_capacity = cleanAndParseFloat(row['Capacidade de produção']);
                tempCountries[countryName].tech_level_vehicles = cleanAndParseFloat(row['Nível Veiculos']);
            }
        });

        metaisRaw.forEach(row => {
            const countryName = row['País'] ? row['País'].trim() : ''; 
            if (countryName && tempCountries[countryName]) { 
                tempCountries[countryName].metal_balance = cleanAndParseFloat(row['Saldo']); 
            }
        });
        
        tempCountries["Genérico / Padrão"] = {
            production_capacity: 100000000,
            metal_balance: 5000000,
            tech_level_vehicles: 50,
            tech_civil: 50,
            urbanization: 50
        };

        gameData.countries = tempCountries;
        populateCountryDropdown();
        countryDropdown.disabled = false;
        updateCalculations(); 

    } catch (error) {
        console.error("Erro fatal ao carregar dados das planilhas:", error);
        countryDropdown.innerHTML = '<option value="error">Erro ao carregar</option>';
        gameData.countries = { "Genérico / Padrão": { production_capacity: 100000000, metal_balance: 5000000, tech_level_vehicles: 50, tech_civil: 50, urbanization: 50 } };
        populateCountryDropdown();
        countryDropdown.disabled = false;
        updateCalculations();
        document.getElementById('status').textContent = `Erro: ${error.message}. Usando dados genéricos.`;
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
        option.textContent = countryName;
        dropdown.appendChild(option);
    });
    if (gameData.countries["Genérico / Padrão"]) {
        dropdown.value = "Genérico / Padrão";
    }
}

function getSelectedText(elementId) {
    const selectEl = document.getElementById(elementId);
    return (selectEl && selectEl.selectedIndex >= 0) ? selectEl.options[selectEl.selectedIndex].text : 'N/A';
}

function calculateEffectiveArmor(thickness, angle) {
    if (thickness <= 0) return 0;
    const angleRad = angle * (Math.PI / 180);
    return thickness / Math.cos(angleRad);
}

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
        if (resistivePower > effectivePowerWatts) high = mid;
        else low = mid;
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
        powerToWeightRatio: stats.engine.powerHp / stats.weightTonnes,
        accelerationScore: accelerationScore,
    };
}

// --- FUNÇÃO PRINCIPAL DE CÁLCULO ---
function updateCalculations() {
    // --- Variáveis de Saída ---
    let baseUnitCost = 0;
    let baseMetalCost = 0;
    let totalWeight = 0;
    let totalPower = 0;
    let effectiveArmorFront = 0;
    let effectiveArmorSide = 0;
    let totalReliability = gameData.constants.base_reliability;
    let crewComfort = gameData.constants.crew_comfort_base;
    let maxRangeModifier = 1;
    let speedRoadMultiplier = 1;
    let speedOffroadMultiplier = 1;
    let armorEffectiveMultiplier = 1;
    let maneuverabilityMultiplier = 1;
    let fuelConsumptionMultiplier = 1;
    let overallReliabilityMultiplier = 1;

    // --- Entradas do Usuário ---
    const vehicleName = document.getElementById('vehicle_name').value || 'Blindado Sem Nome';
    const quantity = parseInt(document.getElementById('quantity').value) || 1;
    let numCrewmen = parseInt(document.getElementById('num_crewmen').value) || 0;
    const selectedCountryName = document.getElementById('country_doctrine').value;
    const selectedTankDoctrine = document.getElementById('tank_doctrine').value;
    const vehicleType = document.getElementById('vehicle_type').value;
    const mobilityType = document.getElementById('mobility_type').value;
    const suspensionType = document.getElementById('suspension_type').value;
    const engineType = document.getElementById('engine_type').value;
    const enginePower = parseInt(document.getElementById('engine_power').value) || 0;
    const fuelType = document.getElementById('fuel_type').value;
    const engineDisposition = document.getElementById('engine_disposition').value;
    const transmissionType = document.getElementById('transmission_type').value;
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

    // --- Dados do Tanque para Retorno ---
    let tankDataOutput = {};

    // --- Processamento ---
    let doctrineCostModifier = 1;
    let doctrineName = '-';
    let countryCostReductionFactor = 0;
    let countryProductionCapacity = 0;
    let countryMetalBalance = 0;
    let armorCostWeightReduction = 0;
    let engineCostWeightReduction = 0;
    let armorCostWeightIncrease = 0;
    let maxMainGunCaliberLimit = Infinity;
    let secondaryArmamentLimitPenalty = 0;
    let advancedComponentCostIncrease = 0;
    let complexComponentReliabilityPenalty = 0;
    let doctrineProductionQualitySliderBias = 0;

    const countryData = gameData.countries[selectedCountryName];
    if (countryData) {
        countryProductionCapacity = parseFloat(countryData.production_capacity) || 0;
        countryMetalBalance = parseFloat(countryData.metal_balance) || 0;
        const civilTechLevel = Math.min(parseFloat(countryData.tech_civil) || 0, gameData.constants.max_tech_civil_level);
        const urbanizationLevel = Math.min(parseFloat(countryData.urbanization) || 0, gameData.constants.max_urbanization_level);
        let civilTechReduction = (civilTechLevel / gameData.constants.max_tech_civil_level) * gameData.constants.civil_tech_cost_reduction_factor;
        let urbanizationReduction = (urbanizationLevel / gameData.constants.max_urbanization_level) * gameData.constants.urbanization_cost_reduction_factor;
        countryCostReductionFactor = Math.min(0.75, civilTechReduction + urbanizationReduction); 
        document.getElementById('country_bonus_note').textContent = `Bônus de ${selectedCountryName}: Redução de Custo de ${(countryCostReductionFactor * 100).toFixed(1)}%.`;
    }

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
        doctrineName = doctrineData.name;
        document.getElementById('doctrine_note').textContent = doctrineData.description;
        armorCostWeightReduction = doctrineData.armor_cost_weight_reduction_percent || 0;
        engineCostWeightReduction = doctrineData.engine_cost_weight_reduction_percent || 0;
        armorCostWeightIncrease = doctrineData.armor_cost_weight_increase_percent || 0;
        maxMainGunCaliberLimit = doctrineData.max_main_gun_caliber_limit || Infinity;
        secondaryArmamentLimitPenalty = doctrineData.secondary_armament_limit_penalty || 0;
        advancedComponentCostIncrease = doctrineData.advanced_component_cost_increase || 0;
        complexComponentReliabilityPenalty = doctrineData.complex_component_reliability_penalty || 0;
        doctrineProductionQualitySliderBias = doctrineData.production_quality_slider_bias || 0;
        if (doctrineData.country_production_capacity_bonus) countryProductionCapacity *= (1 + doctrineData.country_production_capacity_bonus);
    } else {
        document.getElementById('doctrine_note').textContent = '';
    }

    let typeData = null;
    let vehicleTypeName = '-';
    if (vehicleType && gameData.components.vehicle_types[vehicleType]) {
        typeData = gameData.components.vehicle_types[vehicleType];
        baseUnitCost += typeData.cost;
        baseMetalCost += typeData.metal_cost || 0;
        totalWeight += typeData.weight;
        vehicleTypeName = typeData.name;
    }

    let mobilityData = null; 
    let mobilityTypeName = '-';
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

    let suspensionData = null; 
    let suspensionTypeName = '-';
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
        document.getElementById('suspension_note').textContent = suspensionData.description;
        suspensionTypeName = suspensionData.name;
        suspensionDescription = suspensionData.description;
    }

    let engineData = null;
    let engineTypeName = '-';
    if (engineType && gameData.components.engines[engineType]) { 
        engineData = gameData.components.engines[engineType];
        engineTypeName = engineData.name;
        if (enginePower >= engineData.min_power && enginePower <= engineData.max_power) {
            let engineComponentCost = engineData.cost * (1 - engineCostWeightReduction);
            if (engineData.complex && advancedComponentCostIncrease > 0) engineComponentCost *= (1 + advancedComponentCostIncrease);
            baseUnitCost += engineComponentCost;
            baseMetalCost += (engineData.metal_cost || 0) * (1 - engineCostWeightReduction);
            totalWeight += engineData.weight;
            totalPower = enginePower;
            overallReliabilityMultiplier *= engineData.base_reliability;
        }
    }

    let fuelData = null; 
    let fuelTypeName = '-';
    let fuelTypeDescription = '';
    if (fuelType && gameData.components.fuel_types[fuelType]) { 
        fuelData = gameData.components.fuel_types[fuelType];
        fuelTypeName = fuelData.name;
        fuelTypeDescription = fuelData.description;
        if (engineData) {
            baseUnitCost += (engineData.cost * (fuelData.cost_mod - 1));
            baseMetalCost += (engineData.metal_cost || 0) * (fuelData.cost_mod - 1);
        }
        fuelConsumptionMultiplier *= fuelData.consumption_mod;
        totalPower *= fuelData.power_mod;
        overallReliabilityMultiplier *= (1 - fuelData.fire_risk_mod); 
    }

    let dispositionData = null; 
    let engineDispositionName = '-';
    let engineDispositionDescription = '';
    if (engineDisposition && gameData.components.engine_dispositions[engineDisposition]) { 
        dispositionData = gameData.components.engine_dispositions[engineDisposition];
        baseUnitCost += dispositionData.cost;
        totalWeight += dispositionData.weight;
        engineDispositionName = dispositionData.name;
        engineDispositionDescription = dispositionData.description;
    }

    let transmissionData = null; 
    let transmissionTypeName = '-';
    let transmissionDescription = '';
    if (transmissionType && gameData.components.transmission_types[transmissionType]) { 
        transmissionData = gameData.components.transmission_types[transmissionType];
        let transmissionComponentCost = transmissionData.cost;
        if (transmissionData.complex && advancedComponentCostIncrease > 0) transmissionComponentCost *= (1 + advancedComponentCostIncrease);
        baseUnitCost += transmissionComponentCost;
        totalWeight += transmissionData.weight;
        speedRoadMultiplier *= transmissionData.speed_mod;
        speedOffroadMultiplier *= transmissionData.speed_mod;
        maneuverabilityMultiplier *= transmissionData.maneuver_mod;
        overallReliabilityMultiplier *= (1 + (transmissionData.reliability_mod || 0));
        crewComfort += transmissionData.comfort_mod * gameData.constants.crew_comfort_base;
        transmissionTypeName = transmissionData.name;
        transmissionDescription = transmissionData.description;
    }

    // Processar Blindagem e Armamentos (lógica similar, omitida para brevidade)
    // ... (código de blindagem, armamentos, equipamentos, tripulação)

    // --- Finalização e UI ---
    let finalUnitCost = baseUnitCost * doctrineCostModifier * (1 - countryCostReductionFactor);
    // ... (restante da lógica de cálculo de performance e atualização da UI)

    tankDataOutput = {
        vehicleName,
        quantity,
        selectedCountryName,
        doctrineName,
        vehicleTypeName,
        mobilityTypeName,
        suspensionTypeName,
        suspensionDescription,
        engineTypeName,
        enginePower,
        fuelTypeName,
        fuelTypeDescription,
        engineDispositionName,
        engineDispositionDescription,
        transmissionTypeName,
        transmissionDescription,
        // ... (todos os outros campos de dados)
        finalUnitCost: Math.round(finalUnitCost).toLocaleString('pt-BR'),
        totalProductionCost: Math.round(finalUnitCost * quantity).toLocaleString('pt-BR'),
        totalMetalCost: Math.round(baseMetalCost * quantity).toLocaleString('pt-BR'),
        totalWeight: Math.round(totalWeight).toLocaleString('pt-BR') + ' kg',
        totalPower: Math.round(totalPower).toLocaleString('pt-BR') + ' hp',
        // ... (etc.)
    };
    
    // Atualiza a UI
    document.getElementById('display_name').textContent = tankDataOutput.vehicleName;
    document.getElementById('display_type').textContent = tankDataOutput.vehicleTypeName;
    document.getElementById('display_doctrine').textContent = tankDataOutput.doctrineName;
    document.getElementById('total_weight').textContent = tankDataOutput.totalWeight;
    document.getElementById('total_power').textContent = tankDataOutput.totalPower;
    document.getElementById('unit_cost').textContent = tankDataOutput.finalUnitCost;
    document.getElementById('total_production_cost').textContent = tankDataOutput.totalProductionCost;
    document.getElementById('total_metal_cost').textContent = tankDataOutput.totalMetalCost;
    // ... (restante das atualizações da UI)

    return tankDataOutput;
}


// --- INICIALIZAÇÃO ---
window.onload = function() {
    loadGameDataFromSheets(); 
    // Adiciona o updateCalculations ao escopo global
    window.updateCalculations = updateCalculations;

    // Adiciona listener para o painel de resumo
    const summaryPanel = document.querySelector('.summary-panel');
    if (summaryPanel) {
        summaryPanel.title = 'Clique para gerar a ficha detalhada do blindado';
        summaryPanel.addEventListener('click', () => {
            const tankData = updateCalculations(); 
            localStorage.setItem('tankSheetData', JSON.stringify(tankData));
            localStorage.setItem('realWorldTanksData', JSON.stringify(realWorldTanks));
            window.open('ficha.html', '_blank');
        });
    }
    
    // Adiciona listeners para todos os inputs
    document.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('change', updateCalculations);
        input.addEventListener('input', updateCalculations);
    });
};
