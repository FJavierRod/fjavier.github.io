        var scene, canvas, renderer, camera, controls, globalObj;
        var meshes = [];
        var pools_names = ["doblerectangular", "dobleromanica", "griega", "romanica", "rectangular", "oasis", "lagdon", "infinity", "oval", "rinon"];
        var pools_map = new Object();
        var pools_interior_map = new Object();
        var escaleras_map = new Object();
        var escaleras_obra_map = new Object();
        var bordes_map = new Object();
        var jacuzzis_map = new Object();
        var jacuzzis_borde_map = new Object();
        var jacuzzisVisible = false;
        var escalerasVisible = false;
        var escalerasObraVisible = true;
        $("#pedido").append('<li id="pedido_stairs"><span style="font-weight:700";>Escaleras de obra</span><i class="fa fa-trash-o" style="font-size:18px; float:right; cursor:pointer;" onclick="addStairs()"></i></li>');
        var bordesVisible = false;

        var poolsTest = [];
        var pools_floors = [];
        var uniforms;
        var actualpool;
        var actualpoolmaterial;
        var actualpoolshape;
        var lastpoolshape = null;

        var actualpoolname;
        var actualpoolmaterialname;
        var actualfloormaterialname;

        var next = 0;
        var textureLoader = new THREE.TextureLoader();
        var mtlLoader = new THREE.MTLLoader();
        var objLoader = new THREE.OBJLoader();
        mtlLoader.setPath("3d_models/");
        objLoader.setPath("3d_models/");
        var count = 0;

        var controller = new function () {
            this.scaleX = 1;
            this.scaleY = 1;
            this.scaleZ = 1;
        }
        //WATER
        var water, waterGeometry;
        //METAL settings
        var settings = {
            metalness: 0.8,
            roughness: 0.6,
            envMapIntensity: 0.5
        };
        //METAL material
        var metalico = new THREE.MeshStandardMaterial({
            color: 0xeeeeee,
            roughness: settings.roughness,
            metalness: settings.metalness,
            envMapIntensity: settings.envMapIntensity,

            side: THREE.DoubleSide
        });
        //WATER
        var water, waterGeometry;
        var params = {
            color: "#ffffff",
            scale: 3,
            flowX: 1,
            flowY: 1
        };


        /*
         *
         *
         *
         *
         *
         *
         *
         *
         *
         *
         *
         */
        $(".pool").click(function () {
            var np = $(this).attr('id');
            actualpoolshape = $(this);

            //Mecanica para remarcar la piscina seleccionada.
            if (lastpoolshape == actualpoolshape) {
                $(this).attr("src", "imgs/icon-" + np + "-.png");
            } else {
                lastpoolshape.attr("src", "imgs/icon-" + lastpoolshape.attr('id') + "-black.png");
                $(this).attr("src", "imgs/icon-" + np + "-.png");
            }

            //Cambiar siluetas para ext, borde y dentro piscina - materiales
            $("#border").attr("src", "imgs/" + np + "-border.png");
            $("#poolmaterial").attr("src", "imgs/" + np + "-pool.png");
            $("#floormaterial").attr("src", "imgs/" + np + "-floor.png");


            lastpoolshape = $(this);

            changePool(np);
        });

        //Inicializamos el estilo de lo que va marcado por defecto (escaleras obra, jacuzzis, etc)
        $("#extra-jacuzzi").css("border", "none");
        $("#extra-stairs").css("border", "2px solid rgba(60,60,60,.8)");
        $("#extra-stairs-hand").css("border", "none");
        $("#border").css("border", "none");
        $("#poolmaterial").css("border", "2px solid rgba(60,60,60,.8)");
        $("#floormaterial").css("border", "none");

        //Elección material de la piscina (interior)
        $(".mat-pool").click(function () {
            var np = $(this).attr('id');
            changePoolMaterial(np);
        });

        //Elección material de la piscina (exterior)
        $(".mat-floor").click(function () {
            var np = $(this).attr('id');
            changeFloorMaterial(np);
        });

        //Añadir extras (jacuzzis, escaleras de obra, escaleras de mano)

        $(".extras").click(function () {
            var np = $(this).attr('id');
            switch (np) {
                case "extra-jacuzzi":
                    addJacuzzis();
                    break;
                case "extra-stairs":
                    addStairs();
                    break;
                case "extra-stairs-hand":
                    addStairsHand();
                    break;
            }
        });

        //Añadimos borde ó cambiamos materiales
        $(".pool2").click(function () {
            var np = $(this).attr('id');
            switch (np) {
                case 'border':
                    addBorder();
                    break;
                case 'poolmaterial':
                    showPoolMaterial();
                    break;
                case 'floormaterial':
                    showFloorMaterial();
                    break;
                default:
                    console.log('Error on ".pool2" click');
                    break;
            }
        })

        function init() {
            document.body.style.overflow = 'hidden';

            scene = new THREE.Scene();
            scene.background = new THREE.Color(0xe1e1e1);
            scene.fog = new THREE.Fog(0xf2f2f2, 0.0025, 6000);


            canvas = document.getElementById("canvas");

            initMeshes();
            initLights();
            initCamera();
            //initWater();
            initSky();


            renderer = new THREE.WebGLRenderer({
                clearColor: 0xffffff,
                clearAlpha: 1,
                canvas: canvas,
                antialias: true
            });
            renderer.autoClear = false;
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            document.body.appendChild(renderer.domElement);
            /*
            var gui = new dat.GUI();
            var mod = gui.addFolder('Modelo 3D');
            mod.add(controller, 'scaleX', 0.1, 100).onChange(function () {
                globalObj.scale.x = (controller.scaleX);
            });
            mod.add(controller, 'scaleY', 0.1, 100).onChange(function () {
                globalObj.scale.y = (controller.scaleY);
            });
            mod.add(controller, 'scaleZ', 0.1, 100).onChange(function () {
                globalObj.scale.z = (controller.scaleZ);
            });
            mod.open();*/

            animate();
        }

        function initSky() {
            vertexShader = document.getElementById("vertexShader").textContent;
            fragmentShader = document.getElementById("fragmentShader").textContent;
            uniforms = {
                topColor: {
                    value: new THREE.Color(0x0055ff)
                },
                bottomColor: {
                    value: new THREE.Color(0xf2f2f2)
                },
                offset: {
                    value: 00
                },
                exponent: {
                    value: 1
                }
            };
            //uniforms.topColor.value.copy( skyColor );

            scene.fog.color.copy(uniforms.bottomColor.value);

            var skyGeo = new THREE.SphereGeometry(6000, 32, 15);
            var skyMat = new THREE.ShaderMaterial({
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                uniforms: uniforms,
                side: THREE.BackSide
            });

            sky = new THREE.Mesh(skyGeo, skyMat);
            scene.add(sky);
        }

        function initWater() {
            waterGeometry = new THREE.PlaneBufferGeometry(190, 470);

            water = new THREE.Water(waterGeometry, {
                color: params.color,
                scale: params.scale,
                flowDirection: new THREE.Vector2(params.flowX, params.flowY),
                textureWidth: 512, //RESOLUCION MUY ALTA: mejor rendimiento < 512
                textureHeight: 512 //RESOLUCION MUY ALTA: mejor rendimiento < 512
            });

            water.position.y = -107;
            water.position.z = -150;
            water.rotation.x = Math.PI * -0.5;
            scene.add(water);
        }

        function initMeshes() {
            objLoader.load("general.obj", function (obj) {
                globalObj = obj;
                obj.traverse(function (child) {
                    meshes.push(child);
                });
                scene.add(globalObj);
            });

            initPools(count);
        }

        function initPools(count) {
            if (count >= pools_names.length) {
                /* console.log(meshes);
                 console.log(pools_map);
                 console.log(bordes_map);
                 console.log(escaleras_map);
                 console.log(escaleras_obra_map);
                 console.log(jacuzzis_map);*/
                var x = 0;
                for (var i in pools_map) {
                    if (i != "infinity") {
                        pools_map[i].visible = false;
                    } else {
                        next = x;
                        actualpool = pools_map[i];
                        actualpoolshape = $("#" + i);
                        lastpoolshape = $("#" + i);
                        actualpoolname = parsePoolNames("infinity");
                        $("#pedido_pool").html("<span>Piscina <span style='font-weight:700;'>" + actualpoolname + "</span></span>");
                    }
                    x++;
                }
                initTextures();
            } else {
                var pool_name = pools_names[count];
                objLoader.load(pool_name + ".obj", function (obj) {
                    obj.traverse(function (child) {
                        if (child instanceof THREE.Mesh) {
                            meshes.push(child);
                            switch (child.name) {
                                case "escalera_obra_doblerectangular_sombra":
                                case "escalera_obra_dobleromanica_sombra":
                                case "escalera_obra_griega_sombra":
                                case "escalera_obra_rectangular_sombra":
                                case "escalera_obra_romanica_sombra":
                                case "escalera_obra_oasis_sombra":
                                case "escalera_obra_infinity_sombra":
                                case "escalera_obra_lagdon_sombra":
                                case "escalera_obra_rinon_sombra":
                                case "escalera_obra_oval_sombra":
                                    escaleras_obra_map[pool_name] = child;
                                    break;

                                case "jacuzzi_borde_doblerectangular_sombra":
                                case "jacuzzi_borde_dobleromanica_sombra":
                                case "jacuzzi_borde_griega_sombra":
                                case "jacuzzi_borde_rectangular_sombra":
                                case "jacuzzi_borde_romanica_sombra":
                                case "jacuzzi_borde_oasis_sombra":
                                case "jacuzzi_borde_infinity_sombra":
                                case "jacuzzi_borde_lagdon_sombra":
                                case "jacuzzi_borde_rinon_sombra":
                                case "jacuzzi_borde_oval_sombra":
                                    child.visible = false;
                                    jacuzzis_borde_map[pool_name] = child;
                                    break;

                                case "jacuzzi_doblerectangular_sombra":
                                case "jacuzzi_dobleromanica_sombra":
                                case "jacuzzi_griega_sombra":
                                case "jacuzzi_rectangular_sombra":
                                case "jacuzzi_romanica_sombra":
                                case "jacuzzi_oasis_sombra":
                                case "jacuzzi_infinity_sombra":
                                case "jacuzzi_lagdon_sombra":
                                case "jacuzzi_rinon_sombra":
                                case "jacuzzi_oval_sombra":
                                    child.visible = false;
                                    jacuzzis_map[pool_name] = child;
                                    break;

                                case "escalera_doblerectangular_sombra":
                                case "escalera_dobleromanica_sombra":
                                case "escalera_griega_sombra":
                                case "escalera_rectangular_sombra":
                                case "escalera_romanica_sombra":
                                case "escalera_oasis_sombra":
                                case "escalera_infinity_sombra":
                                case "escalera_lagdon_sombra":
                                case "escalera_rinon_sombra":
                                case "escalera_oval_sombra":
                                    child.visible = false;
                                    escaleras_map[pool_name] = child;
                                    break;

                                case "doblerectangular_borde_sombra":
                                case "dobleromanica_borde_sombra":
                                case "griega_borde_sombra":
                                case "rectangular_borde_sombra":
                                case "romanica_borde_sombra":
                                case "oasis_borde_sombra":
                                case "infinity_borde_sombra":
                                case "lagdon_borde_sombra":
                                case "rinon_borde_sombra":
                                case "oval_borde_sombra":
                                    child.visible = false;
                                    bordes_map[pool_name] = child;
                                    break;
                                case "doblerectangular_sombra":
                                case "dobleromanica_sombra":
                                case "griega_sombra":
                                case "rectangular_sombra":
                                case "romanica_sombra":
                                case "oasis_sombra":
                                case "infinity_sombra":
                                case "lagdon_sombra":
                                case "rinon_sombra":
                                case "oval_sombra":
                                    pools_interior_map[pool_name] = child;
                                    break;
                            }
                        }
                    });
                    scene.add(obj);
                    obj.name = pool_name;
                    pools_map[pool_name] = obj;
                    poolsTest.push(obj); ///quitar
                    initPools(count + 1);
                });
            }
        }

        function getPool(k) {
            return pools_map[k];
        }

        function initLights() {
            var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.4);
            hemiLight.color.setHSL(1, 1, 1);
            hemiLight.groundColor.setHSL(0.095, 1, 0.75);
            hemiLight.position.set(0, -1, 0);
            scene.add(hemiLight);


            var light = new THREE.DirectionalLight(0xffffff, 0.9);
            var helper = new THREE.DirectionalLightHelper(light, 50, 0xff0000);


            light.position.set(-800, 800, -800);
            light.lookAt = new THREE.Vector3(0, 0, 0);
            light.castShadow = true;
            light.shadow.camera.top = 1000;
            light.shadow.camera.bottom = -1000;
            light.shadow.camera.left = -1000;
            light.shadow.camera.right = 1000;
            light.shadow.camera.far = 2500;
            light.shadow.mapSize.width = 1024; // RESOLUCION MUY ALTA: mejor rendimiento 1024
            light.shadow.mapSize.height = 1024; // RESOLUCION MUY ALTA: mejor rendimiento 1024
            scene.add(light);
            //scene.add(helper);
            var helper2 = new THREE.CameraHelper(light.shadow.camera);
            //scene.add(helper2);
        }

        function initTextures() {

            for (var i = 0; i < meshes.length; i++) {
                meshes[i].receiveShadow = true;
                if (meshes[i].name.includes("sombra")) {
                    meshes[i].castShadow = true;
                    meshes[i].material = new THREE.MeshPhongMaterial({
                        color: 0xff0000
                    });
                }

                switch (meshes[i].name) {
                    case "extCesped_sombra":
                        meshes[i].material = new THREE.MeshPhongMaterial({
                            map: new THREE.TextureLoader().load("textures/web-textures/hierba04.jpg")
                        });
                        meshes[i].material.map.wrapS = THREE.RepeatWrapping;
                        meshes[i].material.map.wrapT = THREE.RepeatWrapping;
                        break;
                    case "extEscaleras_sombra":
                        meshes[i].material = new THREE.MeshPhongMaterial({
                            color: 0xffffe6
                        });
                        break;
                    case "extMuroLimite_sombra":
                    case "extMuro_sombra":
                        meshes[i].material = new THREE.MeshPhongMaterial({
                            map: new THREE.TextureLoader().load("textures/web-textures/borde_piscina.jpg")
                        });
                        meshes[i].material.map.wrapS = THREE.RepeatWrapping;
                        meshes[i].material.map.wrapT = THREE.RepeatWrapping;
                        break;
                    case "extMuroLimite1_sombra":
                        meshes[i].material = new THREE.MeshPhongMaterial({
                            map: new THREE.TextureLoader().load("textures/web-textures/stone-wall.jpg")
                        });
                        meshes[i].material.map.wrapS = THREE.RepeatWrapping;
                        meshes[i].material.map.wrapT = THREE.RepeatWrapping;
                        break;
                    case "extRocas1_sombra":
                        meshes[i].material = new THREE.MeshPhongMaterial({
                            map: new THREE.TextureLoader().load("textures/web-textures/pebbles-stone.jpg")
                        });
                        meshes[i].material.map.wrapS = THREE.RepeatWrapping;
                        meshes[i].material.map.wrapT = THREE.RepeatWrapping;

                        break;
                    case "extRocas_sombra":
                        meshes[i].material = new THREE.MeshPhongMaterial({
                            map: new THREE.TextureLoader().load("textures/web-textures/rock.jpg")
                        });
                        meshes[i].material.map.wrapS = THREE.RepeatWrapping;
                        meshes[i].material.map.wrapT = THREE.RepeatWrapping;
                        break;
                    case "extSombrilla_sombra":
                        meshes[i].material = new THREE.MeshPhongMaterial({
                            color: 0xffff99
                        });
                        break;
                    case "extSombrillaSoporte_sombra":
                        meshes[i].material = new THREE.MeshPhongMaterial({
                            color: 0x727272
                        });
                        break;
                    case "extSuelo1_sombra":
                    case "extSuelo_sombra":
                        meshes[i].material = new THREE.MeshPhongMaterial({
                            map: new THREE.TextureLoader().load("textures/web-textures/piscina_suelo.jpg")
                        });
                        meshes[i].material.map.wrapS = THREE.RepeatWrapping;
                        meshes[i].material.map.wrapT = THREE.RepeatWrapping;
                        break;
                    case "extTumbona_sombra":
                        meshes[i].material = new THREE.MeshPhongMaterial({
                            color: 0xf2f2f2
                        });
                        break;
                    case "doblerectangular_sombra":
                    case "dobleromanica_sombra":
                    case "griega_sombra":
                    case "rectangular_sombra":
                    case "romanica_sombra":
                    case "oasis_sombra":
                    case "infinity_sombra":
                    case "lagdon_sombra":
                    case "rinon_sombra":
                    case "oval_sombra":

                    case "escalera_obra_doblerectangular_sombra":
                    case "escalera_obra_dobleromanica_sombra":
                    case "escalera_obra_griega_sombra":
                    case "escalera_obra_rectangular_sombra":
                    case "escalera_obra_romanica_sombra":
                    case "escalera_obra_oasis_sombra":
                    case "escalera_obra_infinity_sombra":
                    case "escalera_obra_lagdon_sombra":
                    case "escalera_obra_rinon_sombra":
                    case "escalera_obra_oval_sombra":

                    case "jacuzzi_doblerectangular_sombra":
                    case "jacuzzi_dobleromanica_sombra":
                    case "jacuzzi_griega_sombra":
                    case "jacuzzi_rectangular_sombra":
                    case "jacuzzi_romanica_sombra":
                    case "jacuzzi_oasis_sombra":
                    case "jacuzzi_infinity_sombra":
                    case "jacuzzi_lagdon_sombra":
                    case "jacuzzi_rinon_sombra":
                    case "jacuzzi_oval_sombra":
                        meshes[i].material = new THREE.MeshPhongMaterial({
                            map: new THREE.TextureLoader().load("textures/web-textures/gresite-blue.jpg"),
                        });
                        meshes[i].material.map.wrapS = THREE.RepeatWrapping;
                        meshes[i].material.map.wrapT = THREE.RepeatWrapping;
                        actualpoolmaterial = meshes[i].material;
                        actualpoolmaterialname = parsePoolMaterialNames("gresite-blue");
                        $("#pedido_materialpool").html("<span>Material piscina <span style='font-weight:700;'>" + actualpoolmaterialname + "</span></span>");
                        break;

                    case "escalera_doblerectangular_sombra":
                    case "escalera_dobleromanica_sombra":
                    case "escalera_griega_sombra":
                    case "escalera_rectangular_sombra":
                    case "escalera_romanica_sombra":
                    case "escalera_oasis_sombra":
                    case "escalera_infinity_sombra":
                    case "escalera_lagdon_sombra":
                    case "escalera_rinon_sombra":
                    case "escalera_oval_sombra":
                        meshes[i].material = new THREE.MeshPhongMaterial({
                            color: 0xd9d9d9
                        });
                        break;
                }

                if (meshes[i].name.includes("_suelo")) {
                    meshes[i].material = new THREE.MeshPhongMaterial({
                        map: new THREE.TextureLoader().load("textures/web-textures/tarima-wood-jatoba.jpg"),
                        normalMap: new THREE.TextureLoader().load("textures/web-textures/tarima-normalMap.jpg")
                    });
                    meshes[i].material.map.wrapS = THREE.RepeatWrapping;
                    meshes[i].material.map.wrapT = THREE.RepeatWrapping;
                    meshes[i].material.normalMap.wrapS = THREE.RepeatWrapping;
                    meshes[i].material.normalMap.wrapT = THREE.RepeatWrapping;
                    actualfloormaterial = meshes[i].material;
                    pools_floors.push(meshes[i]);
                    actualfloormaterialname = parseFloorMaterialNames("tarima-wood-jatoba");
                    $("#pedido_materialfloor").html("<span>Material suelo <span style='font-weight:700;'>" + actualfloormaterialname + "</span></span>");
                } else if (meshes[i].name.includes("_borde")) {
                    meshes[i].material = new THREE.MeshPhongMaterial({
                        map: new THREE.TextureLoader().load("textures/web-textures/borde_piscina.jpg")
                    });
                    meshes[i].material.map.wrapS = THREE.RepeatWrapping;
                    meshes[i].material.map.wrapT = THREE.RepeatWrapping;
                }

            }
        }

        function initCamera() {
            camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 10, 10000);

            controls = new THREE.OrbitControls(camera);
            camera.position.set(500, 500, 500);
            controls.autoRotate = true;
            controls.autoRotateSpeed = .3;
            controls.enablePan = false;
            controls.minDistance = 700;
            controls.maxDistance = 2000;
            controls.maxPolarAngle = 0.9 * Math.PI / 2;
            controls.target = new THREE.Vector3(0, 0, 0);
        }

        function animate() {
            requestAnimationFrame(animate);

            controls.update();

            renderer.clear();
            renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
            renderer.render(scene, camera);
        }

        function onWindowResize() {

            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            renderer.setSize(window.innerWidth, window.innerHeight);

        }

        function onKeyDown(event) {}

        function changePool(pool_name) {
            actualpool.visible = false;
            pools_map[pool_name].visible = true;
            actualpool = pools_map[pool_name];
            actualpoolname = parsePoolNames(pool_name);
            $("#pedido_pool").html("<span>Piscina <span style='font-weight:700;'>" + actualpoolname + "</span></span>");
            //console.log("CAMBIO DE PISCINA");
        }

        function changePoolMaterial(material_name) {
            if (material_name != "defect") {
                var stringmaterial = "textures/web-textures/" + material_name + ".jpg";
                var mat = new THREE.MeshPhongMaterial({
                    map: new THREE.TextureLoader().load(stringmaterial)
                });
                actualpoolmaterial = mat;
            } else {
                var mat = new THREE.MeshPhongMaterial({
                    color: 0x00ccff
                });
                actualpoolmaterial = mat;
            }

            for (var i in pools_interior_map) {
                var x = pools_interior_map[i];
                x.material = mat;
                x.material.map.wrapS = THREE.RepeatWrapping;
                x.material.map.wrapT = THREE.RepeatWrapping;
            }

            for (var i in jacuzzis_map) {
                var x = jacuzzis_map[i];
                x.material = mat;
                x.material.map.wrapS = THREE.RepeatWrapping;
                x.material.map.wrapT = THREE.RepeatWrapping;
            }

            for (var i in escaleras_obra_map) {
                var x = escaleras_obra_map[i];
                x.material = mat;
                x.material.map.wrapS = THREE.RepeatWrapping;
                x.material.map.wrapT = THREE.RepeatWrapping;
            }

            actualpoolmaterialname = parsePoolMaterialNames(material_name);
            $("#pedido_materialpool").html("<span>Material piscina <span style='font-weight:700;'>" + actualpoolmaterialname + "</span></span>");
        }

        function changeFloorMaterial(material_name) {
            if (material_name != "defect") {
                var stringmaterial = "textures/web-textures/" + material_name + ".jpg";
                var mat = new THREE.MeshPhongMaterial({
                    map: new THREE.TextureLoader().load(stringmaterial),
                    normalMap: new THREE.TextureLoader().load("textures/web-textures/tarima-normalMap.jpg")
                });
                actualfloormaterial = mat;
            } else {
                var mat = new THREE.MeshPhongMaterial({
                    color: 0x00ccff
                });
                actualfloormaterial = mat;
            }

            for (var i = 0; i < pools_floors.length; i++) {
                pools_floors[i].material = actualfloormaterial;
                pools_floors[i].material.map.wrapS = THREE.RepeatWrapping;
                pools_floors[i].material.map.wrapT = THREE.RepeatWrapping;
                pools_floors[i].material.normalMap.wrapS = THREE.RepeatWrapping;
                pools_floors[i].material.normalMap.wrapT = THREE.RepeatWrapping;
            }

            actualfloormaterialname = parseFloorMaterialNames(material_name);
            $("#pedido_materialfloor").html("<span>Material suelo <span style='font-weight:700;'>" + actualfloormaterialname + "</span></span>");
        }


        function addJacuzzis() {
            if (jacuzzisVisible) {
                for (var i in jacuzzis_map) {
                    jacuzzis_map[i].visible = false;
                }
                for (var i in jacuzzis_borde_map) {
                    jacuzzis_borde_map[i].visible = false;
                }
                jacuzzisVisible = false;
                $("#extra-jacuzzi").css("border", "none");
                $("#pedido_jacuzzi").remove();
            } else {
                for (var i in jacuzzis_map) {
                    jacuzzis_map[i].visible = true;
                }
                for (var i in jacuzzis_borde_map) {
                    jacuzzis_borde_map[i].visible = true;
                }
                jacuzzisVisible = true;
                $("#extra-jacuzzi").css("border", "2px solid rgba(60,60,60,.8)");
                $("#pedido").append('<li id="pedido_jacuzzi"><span style="font-weight:700";>Jacuzzi</span><i class="fa fa-trash-o" style="font-size:18px; float:right; cursor:pointer;" onclick="addJacuzzis()"></i></li>');
            }
        }

        function addStairs() {
            if (escalerasObraVisible) {
                for (var i in escaleras_obra_map) {
                    escaleras_obra_map[i].visible = false;
                }
                escalerasObraVisible = false;
                $("#extra-stairs").css("border", "none");
                $("#pedido_stairs").remove();
            } else {
                for (var i in escaleras_obra_map) {
                    escaleras_obra_map[i].visible = true;
                }
                escalerasObraVisible = true;
                $("#extra-stairs").css("border", "2px solid rgba(60,60,60,.8)");
                $("#pedido").append('<li id="pedido_stairs"><span style="font-weight:700";>Escaleras de obra</span><i class="fa fa-trash-o" style="font-size:18px; float:right; cursor:pointer;" onclick="addStairs()"></i></li>');
            }
        }

        function addStairsHand() {
            if (escalerasVisible) {
                for (var i in escaleras_map) {
                    escaleras_map[i].visible = false;
                }
                escalerasVisible = false;
                $("#extra-stairs-hand").css("border", "none");
                $("#pedido_stairshand").remove();
            } else {
                for (var i in escaleras_map) {
                    escaleras_map[i].visible = true;
                }
                escalerasVisible = true;
                $("#extra-stairs-hand").css("border", "2px solid rgba(60,60,60,.8)");
                $("#pedido").append('<li id="pedido_stairshand"><span style="font-weight:700";>Escalera de mano</span><i class="fa fa-trash-o" style="font-size:18px; float:right; cursor:pointer;" onclick="addStairsHand()"></i></li>');
            }
        }

        function addBorder() {
            console.log(actualpool);
            console.log(actualfloormaterial);
            console.log(actualfloormaterial);
            if (bordesVisible) {
                for (var i in bordes_map) {
                    bordes_map[i].visible = false;
                }
                bordesVisible = false;
                $("#border").css("border", "none");
                $("#pedido_borde").remove();
            } else {
                for (var i in bordes_map) {
                    bordes_map[i].visible = true;
                }
                bordesVisible = true;

                $("#border").css("border", "2px solid rgba(60,60,60,.8)");
                $("#pedido").append('<li id="pedido_borde"><span style="font-weight:700";>Borde exterior</span><i class="fa fa-trash-o" style="font-size:18px; float:right; cursor:pointer;" onclick="addBorder()"></i></li>');
            }
        }

        function showPoolMaterial() {
            $("#poolmaterial").css("border", "2px solid rgba(60,60,60,.8)");
            $("#floormaterial").css("border", "none");
            $("#pool-materials").css("display", "");
            $("#floor-materials").css("display", "none");
        }

        function showFloorMaterial() {
            $("#floormaterial").css("border", "2px solid rgba(60,60,60,.8)");
            $("#poolmaterial").css("border", "none");
            $("#pool-materials").css("display", "none");
            $("#floor-materials").css("display", "");
        }

        function parsePoolNames(pool_name) {
            var final_name;
            switch (pool_name) {
                case "doblerectangular":
                    final_name = "Doble-Rectangular"
                    break;
                case "dobleromanica":
                    final_name = "Doble-Romanica"
                    break;
                case "griega":
                    final_name = "Griega"
                    break;
                case "infinity":
                    final_name = "Infinity"
                    break;
                case "lagdon":
                    final_name = "Lagdon"
                    break;
                case "oasis":
                    final_name = "Oasis"
                    break;
                case "oval":
                    final_name = "Oval"
                    break;
                case "rectangular":
                    final_name = "Rectangular"
                    break;
                case "rinon":
                    final_name = "Riñon"
                    break;
                case "romanica":
                    final_name = "Romanica"
                    break;
                default:
                    final_name = ""
                    break;
            }
            return final_name;
        }

        function parsePoolMaterialNames(material_name) {
            var final_name;
            switch (material_name) {
                case "gresite-mix":
                    final_name = "Azul Variado"
                    break;
                case "gresite-blue":
                    final_name = "Azul"
                    break;
                case "gresite-darkblue":
                    final_name = "Azul Marino"
                    break;
                case "gresite-white":
                    final_name = "Blanco"
                    break;
                case "gresite-grey":
                    final_name = "Gris"
                    break;
                case "gresite-black":
                    final_name = "Negro"
                    break;
                case "gresite-green":
                    final_name = "Verde"
                    break;
                case "gresite-turquois":
                    final_name = "Turquesa"
                    break;
                case "gresite-pink":
                    final_name = "Rosa"
                    break;
                case "gresite-red":
                    final_name = "Rojo"
                    break;
                case "gresite-orange":
                    final_name = "Naranja"
                    break;
                case "gresite-yellow":
                    final_name = "Amarillo"
                    break;
                default:
                    final_name = ""
                    break;
            }
            return final_name;
        }

        function parseFloorMaterialNames(material_name) {
            var final_name;
            switch (material_name) {
                case "tarima-wood-haya":
                    final_name = "Haya"
                    break;
                case "tarima-wood-jatoba":
                    final_name = "Jatoba"
                    break;
                case "tarima-wood-nogal":
                    final_name = "Nogal"
                    break;
                case "tarima-wood-nogalDark":
                    final_name = "Nogal Oscuro"
                    break;
                case "tarima-wood-roble":
                    final_name = "Roble"
                    break;
                case "tarima-wood-white":
                    final_name = "Blanco"
                    break;
                default:
                    final_name = ""
                    break;
            }
            return final_name;
        }


        window.addEventListener('resize', onWindowResize, false);
        window.addEventListener('keydown', onKeyDown, false);
        window.onload = init();
